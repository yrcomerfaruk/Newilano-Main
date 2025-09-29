import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/Product';

export async function GET() {
  await connectToDatabase();
  // Aggregate distinct genders with counts > 0
  const pipeline = [
    { $match: { gender: { $exists: true, $nin: [null, ''] } } },
    { $group: { _id: { $toUpper: '$gender' }, count: { $sum: 1 } } },
  ];
  const results = await Product.aggregate<{ _id: string; count: number }>(pipeline);
  const genders = results
    .map((r) => ({ gender: r._id as 'ERKEK' | 'KADIN' | 'UNISEX', count: r.count }))
    .filter((g) => g.count > 0);

  return NextResponse.json({ genders });
}
