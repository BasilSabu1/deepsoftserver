const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Menu = require('./models/menu');
const MenuItem = require('./models/menuitem');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.post('/menu', async (req, res) => {
  const { name, description } = req.body;

  try {
    const menu = new Menu({ name, description });
    await menu.save();
    res.status(201).json(menu);
  } catch (error) {
    res.status(500).json({ error: 'Error creating menu' });
  }
});

app.get('/menu', async (req, res) => {
  try {
    const menus = await Menu.find();
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching menus' });
  }
});

app.patch('/menu/:menuId', async (req, res) => {
  const { menuId } = req.params;
  const updates = req.body;

  try {
    const updatedMenu = await Menu.findByIdAndUpdate(menuId, updates, { new: true });
    if (!updatedMenu) {
      return res.status(404).json({ error: 'Menu not found' });
    }
    res.json(updatedMenu);
  } catch (error) {
    res.status(500).json({ error: 'Error updating menu' });
  }
});

app.delete('/menu/:menuId', async (req, res) => {
  const { menuId } = req.params;

  try {
    const deletedMenu = await Menu.findByIdAndDelete(menuId);
    if (!deletedMenu) {
      return res.status(404).json({ error: 'Menu not found' });
    }
    await MenuItem.deleteMany({ menuId });
    res.json({ message: 'Menu and associated items deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting menu' });
  }
});


app.post('/menu/:menuId/item', async (req, res) => {
  const { menuId } = req.params;
  const { name, description, price } = req.body;

  try {
    const menuItem = new MenuItem({ name, description, price, menuId });
    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ error: 'Error creating menu item' });
  }
});

app.get('/menu/:menuId/items', async (req, res) => {
  const { menuId } = req.params;

  try {
    const menuItems = await MenuItem.find({ menuId });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching menu items' });
  }
});

app.patch('/menu/:menuId/item/:itemId', async (req, res) => {
  const { itemId } = req.params;
  const updates = req.body;

  try {
    const updatedMenuItem = await MenuItem.findByIdAndUpdate(itemId, updates, { new: true });
    if (!updatedMenuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json(updatedMenuItem);
  } catch (error) {
    res.status(500).json({ error: 'Error updating menu item' });
  }
});

app.delete('/menu/:menuId/item/:itemId', async (req, res) => {
  const { itemId } = req.params;

  try {
    const deletedMenuItem = await MenuItem.findByIdAndDelete(itemId);
    if (!deletedMenuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting menu item' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
