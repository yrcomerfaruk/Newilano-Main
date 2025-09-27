import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';

const SALT_ROUNDS = 12;

function sanitize(value: string) {
  return value.trim();
}

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Tüm alanlar zorunludur.' }, { status: 400 });
    }

    const cleanName = sanitize(name);
    const cleanEmail = sanitize(email).toLowerCase();

    if (cleanName.length < 2) {
      return NextResponse.json({ message: 'İsim en az 2 karakter olmalıdır.' }, { status: 400 });
    }

    const emailRegex = /.+\@.+\..+/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ message: 'Geçerli bir email giriniz.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: 'Şifre en az 8 karakter olmalıdır.' }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json({ message: 'Bu email ile zaten bir hesap var.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      favorites: []
    });

    return NextResponse.json({ message: 'Kayıt başarılı.' }, { status: 201 });
  } catch (error) {
    console.error('Register error', error);
    return NextResponse.json(
      { message: 'Beklenmeyen bir hata oluştu.' },
      { status: 500 }
    );
  }
}
