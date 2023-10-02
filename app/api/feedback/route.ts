import { auth, currentUser } from '@clerk/nextjs';
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

//oldTypes: { [key: string]: number } = { '0': 3, '1': 2};
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const feedbackText = body.feedbackText;
    const bodyLength = Object.keys(body).length;

    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (bodyLength === 0 || bodyLength > 1 || !feedbackText) {
      return new NextResponse('Invalid body', { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 2525,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let mailOptions = {
      from: 'no-reply@cashdash.com',
      to: 'Leekk270@gmail.com',
      subject: 'New Feedback Received',
      html: `<html><body>${feedbackText}</body></html>`,
    };

    const sendEmail = async (mailOptions: {
      from: string;
      to: string;
      subject: string;
      html: string;
    }) => {
      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve('Feedback sent!');
          }
        });
      });
    };

    await sendEmail(mailOptions);
    return new NextResponse('Feedback sent!', { status: 200 });
  } catch (error: any) {
    console.log(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
