import { Response } from 'express';
import { Op } from 'sequelize';
import Order from '../models/Order';
import { AuthRequest } from '../middleware/auth';

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, totalAmount, discountAmount, finalAmount, couponCode, shippingAddress, phone, prescriptionId } = req.body;
    const order = await Order.create({
      patientId: req.userId!,
      prescriptionId: prescriptionId || null,
      items: JSON.stringify(items),
      totalAmount,
      discountAmount: discountAmount || 0,
      finalAmount,
      couponCode: couponCode || '',
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
    const { status, page = '1', limit = '10' } = req.query;
    const where: any = { patientId: req.userId };
    if (status) where.status = status;

    const total = await Order.count({ where });
    const orders = await Order.findAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: (parseInt(page as string) - 1) * parseInt(limit as string),
      limit: parseInt(limit as string),
    });
    const parsed = orders.map((o) => ({ ...o.toJSON(), items: JSON.parse(o.items) }));
    res.json({ success: true, data: parsed, pagination: { total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)) } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return; }
    res.json({ success: true, data: { ...order.toJSON(), items: JSON.parse(order.items) } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findOne({ where: { id: parseInt(req.params.id), patientId: req.userId } });
    if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return; }
    if (order.status !== 'pending') { res.status(400).json({ success: false, message: 'Only pending orders can be cancelled' }); return; }
    await order.update({ status: 'cancelled' });
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const where: any = {};
    if (status) where.status = status;

    const total = await Order.count({ where });
    const orders = await Order.findAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: (parseInt(page as string) - 1) * parseInt(limit as string),
      limit: parseInt(limit as string),
    });
    const parsed = orders.map((o) => ({ ...o.toJSON(), items: JSON.parse(o.items) }));
    res.json({ success: true, data: parsed, pagination: { total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)) } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return; }
    await order.update({ status: req.body.status });
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};