import { NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/auth';

export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Não autenticado' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.userId,
        email: user.email,
        nome: user.nome,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao verificar autenticação' },
      { status: 500 }
    );
  }
}

