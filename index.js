const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const Campaign = require('./Campaigns');
const User = require('./User');
const Order = require('./Orders');
const Communication = require('./Communications');
const {validateUser} = require('./userValidation');
const {validateOrder} = require('./orderValidation');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test_db';
const app = express();
app.use(express.json());
app.use(cors());


const sendMessages = async (communicationId) => {
  try {
    const communication = await Communication.findById(communicationId).populate('customers.customer');
    if (!communication) {
      throw new Error('Communication not found');
    }

    const sendMessagesPromises = communication.customers.map(async (cust) => {
      const deliveryStatus = Math.random() < 0.9 ? 'SENT' : 'FAILED';
      await axios.post('http://localhost:3000/update-status', {
        communicationId: communication._id,
        customerId: cust.customer._id,
        status: deliveryStatus,
      });
    });

    await Promise.all(sendMessagesPromises);
  } catch (err) {
    console.error('Failed to send messages', err);
  }
};


app.post('/customers', async (req, res) => {
  const { error } = validateUser(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const { name, email, password } = req.body;

  const user = new User({
    name,
    email,
    password,
  });
  await user.save();
  res.json(user);
});


app.post('/orders', async (req, res) => {
  const { error } = validateOrder(req.body);
  if(error) {
    return res.status(400).send(error.details[0].message);
  }
  const { customer, product, quantity, price } = req.body;
  if (!mongoose.Types.ObjectId.isValid(customer)) {
    return res.status(400).send('Invalid customer ID.');
  }

  try {
  const user = await User.findById(customer);
  if (!user) {
    return res.status(404).send('Customer not found.');
  }
  
  user.totalSpents += (price * quantity);
  user.lastVisit = new Date();
  user.totalVisits += 1;
  await user.save();

  const order = new Order({
    customer,
    product,
    quantity,
    price,
  });
  await order.save();
  res.json(order);
} catch (error) {
  console.error('Error creating order: ', error);
  res.status(500).send('An error occurred while creating order.');
}
});


app.get('/get-filtered-customers', async (req, res) => {
  try {
    const filterQuery = req.query.filter ? JSON.parse(req.query.filter) : {};
    const customers = await User.find(filterQuery);
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/save-audience', async (req, res) => {
  try {
    const { customers } = req.body;

    if (!customers || !Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({ message: 'Invalid request body' });
    }

    const customerDetails = await User.find({ '_id': { $in: customers } });
    const communicationCustomers = customerDetails.map(customer => ({
      customer: customer._id,
      message: `Hi ${customer.name}, here is 10% off on your next order`,
    }));

    const communication = new Communication({
      customers: communicationCustomers,
    });
    
    await communication.save();
    await sendMessages(communication._id);
    res.status(201).json(communication);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/campaigns', async (req, res) => {
  const { name, description, audience } = req.body;
  const campaign = new Campaign({
    name,
    description,
    audience,
  });
  await campaign.save();
  res.json(campaign);
});

app.get('/campaigns', async (req, res) => {
  const campaigns = await Campaign.find({}).sort({ createdAt: -1 });
  res.status(200).send(campaigns);
});


app.post('/update-status', async (req, res) => {
  try {
    const { communicationId, customerId, status } = req.body;

    if (!communicationId || !customerId || !status) {
      return res.status(400).json({ message: 'Invalid request body' });
    }

    const communication = await Communication.findById(communicationId);
    if (!communication) {
      return res.status(404).json({ message: 'Communication not found' });
    }

    const customerIndex = communication.customers.findIndex(cust => cust.customer.toString() === customerId);
    if (customerIndex === -1) {
      return res.status(404).json({ message: 'Customer not found in communication' });
    }

    communication.customers[customerIndex].status = status;
    await communication.save();

    res.status(200).json({ message: 'Status updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status' });
  }
});


app.get('/campaign/:id', async (req, res) => {
  try {
    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId).populate('audience');

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    const audience = await Communication.findById(campaign.audience).populate('customers.customer');
    if (!audience) {
      return res.status(404).json({ error: 'Audience not found' });
    }

    res.json({
      campaign,
      audience,
      audienceSize: audience.customers.length,
      sentDetails: audience.customers.filter(c => c.status === 'SENT').length,
      failedDetails: audience.customers.filter(c => c.status === 'FAILED').length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to database');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    

  } catch (error) {
    console.error('Error connecting to database: ', error);
    process.exit(1); 
  }
}

startServer();