import { DataTypes, Model } from 'sequelize';
import {db} from '../config/index';

export interface UserAttributes {
    id: string;
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    salt: string;
    address: string;
    phone: string;
    otp: number;
    otp_expiry: Date;
    lng: number;
    lat: number;
    verified: boolean;
}

export class UserInstance extends 
Model<UserAttributes>{}

UserInstance.init({
    id:{
        type: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notNull:{
                msg: 'Email is required'
            },
            isEmail: {
                msg: 'Email is invalid'
            }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull:{
                msg: 'Password is required'
            },
            notEmpty: {
                msg: 'provide a password'
            }
        }
    },
    firstname: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lastname: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    salt: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull:{
                msg: 'Phone number is required'
            },
            notEmpty: {
                msg: 'provide a phone number'
            }
        }
    },
    otp: {
        type: DataTypes.NUMBER,
        allowNull: false,
        validate: {
            notNull:{
                msg: 'OTP is required'
            },
            notEmpty: {
                msg: 'provide a OTP'
            }
        }
    },
    otp_expiry: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            notNull:{
                msg: 'OTP expired',
            }
        }
    },
    lng: {
        type: DataTypes.NUMBER,
        allowNull: true
    },
    lat: {
        type: DataTypes.NUMBER,
        allowNull: true
    },
    verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        validate: {
            notNull:{
                msg: "User must be verified",
            },
            notEmpty: {
                msg: "User not verified",
            }
        }
    }
},
{
    sequelize: db,
    tableName: 'user'
}
);

