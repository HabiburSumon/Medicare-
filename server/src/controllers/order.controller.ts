import { Response } from 'express';
import Order from '../models/Order';
import Medicine from '../models/Medicine';
import { AuthRequest } from '../middleware/auth';

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, shippingAddress, phone, couponCode, prescriptionId } = req.body;

    // Validate medicines and get prices
    const medicineIds = items.map((item: any) => item.medicineId);
    const medicines = await Medicine.find({ _id: { $in: medicineIds } });

    const orderItems = items.map((item: any) => {
      const medicine = medicines.find((m) => m._id.toString() === item.medicineId);
      if (!medicine) throw new Error(`Medicine ${item.medicineId} not found`);
      if (!medicine.inStock) throw new Error(`${medicine.name} is out of stock`);
      return {
        medicine: medicine._id,
        name: medicine.name,
        quantity: item.quantity,
        price: medicine.price,
      };
    });

    const totalAmount = orderItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const discountAmount = couponCode === 'HEALTH10' ? totalAmount * 0.1 : 0;
    const finalAmount = totalAmount - discountAmount;

    const order = await Order.create({
      patient: req.userId,
      prescription: prescriptionId,
      items: orderItems,
      totalAmount,
      discountAmount,
      finalAmount,
      couponCode,
      shippingAddress,
      phone,
    });

    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ patient: req.userId })
      .populate('items.medicine')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).populate('items.medicine');
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};