import {accountSid, authToken, fromAdminPhone, GMAIL_PASS, GMAIL_USER, fromAdminMail, userSubject} from '../config'
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { response } from 'express';
dotenv.config()
export const GenerateOtp = () => {
    const otp = Math.floor(1000 + Math.random() * 9000);
    console.log(otp);

    const expiry = new Date();

    expiry.setTime(new Date().getTime() +( 30 * 60 * 1000));
    return {otp, expiry};
};


export const onRequestOtp = async(otp:number, toPhoneNumber:string) => {
    const client = require('twilio')(accountSid, authToken);
    const response = await client.messages.create({
        body: `your otp is ${otp}`,
        to: toPhoneNumber,
        from: fromAdminPhone
    });
    return response;

    
}



const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS
    },
    tls:{
        rejectUnauthorized: false
    }
});

export const mailSent = async (
    from:string,
    to:string,
    subject:string,
    html:string
) => {
    try {
         await transporter.sendMail({
            from: fromAdminMail, to, subject: userSubject, html
            
        },)
        return response;

    } catch(err){
        console.log(err);
    }

}

export const emailHtml = (otp:number):string => {
    let response = `
    <div style="max-width:700px;
    margin:auto;
    solid #ccc;
    padding:20px;
    font-size:16px;
    font-family:Helvetica, Arial, sans-serif;
    font-weight:normal;
    line-height:1.5;
    color:#333;
    background:#f8f8f8;
    border:1px solid #ccc;
    border-radius:3px;
    margin-bottom:20px;
    margin-top:20px;
    ">
    <h2 style="text-align:center;
    text-transform:uppercase;
    color:teal;
    ">welcome to Klaus Store</h2>
    <p>Hi there your otp is ${otp}</p>
    </div>`
    return response;
}


//YyIzINNwXII29jvTJr7ixhdWfCCYccv8xYJCg0ue
//4834963




