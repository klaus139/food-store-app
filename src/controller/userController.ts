import { Request, Response } from "express";
import {
  registerSchema,
  options,
  GeneratePassword,
  GenerateSalt,
  onRequestOtp,
  GenerateOtp,
  emailHtml,
  mailSent,
  GenerateSignature,
  verifySignature,
  loginSchema,
  validatePassword,
} from "../utils";
import { v4 as uuid4 } from "uuid";
import { UserAttributes, UserInstance } from "../model/userModel";
import { fromAdminMail, userSubject } from "../config";
import { JwtPayload } from "jsonwebtoken";

export const Register = async (req: Request, res: Response) => {
  try {
    const { email, phone, password, confirm_password } = req.body;

    const uuiduser = uuid4();

    //validate the req.body
    const validateResult = registerSchema.validate(req.body, options);
    if (validateResult.error) {
      // console.log(validateResult.error.details[0].message);
      return res.status(400).json({
        Error: validateResult.error.details[0].message,
      });
    }

    // generate salt
    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    // generate otp amd expiry
    const { otp, expiry } = GenerateOtp();

    // create user
    const User = await UserInstance.findOne({ where: { email: email } });
    if (!User) {
      //create new user
      let user = await UserInstance.create({
        id: uuiduser,
        email,
        password: userPassword,
        firstname: "",
        lastname: "",
        salt,
        address: "",
        phone,
        otp,
        otp_expiry: expiry,
        lng: 0,
        lat: 0,
        verified: false,
      });

      // send otp
      await onRequestOtp(otp, phone);

      // send mail
      const html = emailHtml(otp);

      await mailSent(fromAdminMail, email, userSubject, html);

      // check if user exists
      const User = (await UserInstance.findOne({
        where: { email: email },
      })) as unknown as UserAttributes;

      // generate signature
      let signature = await GenerateSignature({
        id: User.id,
        email: User.email,
        verified: User.verified,
      });

      return res.status(201).json({
        message:
          "user created successfully check your email or phone for otp verification",
        signature,
        verified: User.verified,
      });
    }
    return res.status(400).json({
      message: "user already exist",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Internal Server Error",
      route: "/users/signup",
    });
  }
};

/**========================== verify user=================**/
export const verifyUser = async (req: Request, res: Response) => {
  try {
    const token = req.params.signature;
    const decode = (await verifySignature(token)) as JwtPayload;
    //check if the user is a registered user
    const User = (await UserInstance.findOne({
      where: { email: decode.email },
    })) as unknown as UserAttributes;
    if (User) {
      const { otp } = req.body;
      if (User.otp === parseInt(otp) && User.otp_expiry >= new Date()) {
        const updatedUser = (await UserInstance.update(
          {
            verified: true,
          },
          { where: { email: decode.email } }
        )) as unknown as UserAttributes;

        // Generate new signature
        let signature = await GenerateSignature({
          id: updatedUser.id,
          email: updatedUser.email,
          verified: updatedUser.verified,
        });
        if (updatedUser) {
          const User = (await UserInstance.findOne({
            where: { email: decode.email },
          })) as unknown as UserAttributes;
          return res.status(200).json({
            message: "user verified successfully",
            signature,
            verified: User.verified,
          });
        }
      }
      return res.status(400).json({
        message: "otp already expired",
      });
    }
  } catch (err) {
    res.status(500).json({
      Error: "Internal Server Error",
      route: "/users/verify",
    });
  }
};

/**========================== login user=================**/
export const Login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const validateResult = loginSchema.validate(req.body, options);
    if (validateResult.error) {
      return res.status(400).json({
        Error: validateResult.error.details[0].message,
      });
    }

    //check if user exists
    const User = (await UserInstance.findOne({
      where: { email: email },
    })) as unknown as UserAttributes;
    if (User) {
      const validation = await validatePassword(
        password,
        User.password,
        User.salt
      );
      if (validation) {
        // Generate a new signature for the user
        let signature = await GenerateSignature({
          id: User.id,
          email: User.email,
          verified: User.verified,
        });

        return res.status(200).json({
          message: "You have logged in successfully",
          signature,
          email: User.email,
          verified: User.verified,
        });
      }
    }
    return res.status(400).json({
        message: "incorrect email or password",
    });
  } catch (err) {
    res.status(500).json({
      Error: "Internal Server Error",
      route: "/users/login",
    });
  }
};

/**========================== Resend OTP =================**/
export const resendOTP = async (req: Request, res: Response) => {
    try{
        const token = req.params.signature;
        const decode = await verifySignature(token) as JwtPayload;
        //check if the user is a registered user
       const User = (await UserInstance.findOne({ where: { email: decode.email } })) as unknown as UserAttributes;
         if(User){
            //generate otp
            const { otp, expiry } = GenerateOtp();

            const updatedUser = await UserInstance.update({ 
                otp,
                otp_expiry: expiry
            }, { where: { email: decode.email } }) as unknown as UserAttributes;

            if(updatedUser){
                await onRequestOtp(otp, updatedUser.phone);
            }
            //send mail
            const html = emailHtml(otp);

            await mailSent(fromAdminMail, updatedUser.email, userSubject, html);
            return res.status(200).json({
                message: "OTP resent successfully, Please check your mail or phone"
            });
        }
        return res.status(400).json({
            message: "Error sending OTP"
        });
            
    } catch(err){
        res.status(500).json({
            Error: "Internal Server Error",
            route: "/users/resend-OTP/:signature",
        });
    }
}
