import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/app/lib/auth';

export async function POST() {
  try {
    await clearAuthCookie();

    return NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao fazer logout' },
      { status: 500 }
    );
  }
}

