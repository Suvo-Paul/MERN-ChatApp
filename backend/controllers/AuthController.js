import { compare } from "bcrypt";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { unlinkSync, existsSync } from "fs";

import { renameSync, unlinkSync } from "fs"

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (email, userId) => {
    return jwt.sign({ email, userId }, process.env.JWT_KEY, {
        expiresIn: maxAge
    })
};

export const signup = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send("Please provide email and password");
        }

        const user = await User.create({ email, password });

        res.cookie("jwt", createToken(email, user.id), {
            maxAge,
            secure: true,
            sameSite: "none"
        });

        return res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup
            }
        });
    } catch (error) {
        console.log({ error });
        return res.status(500).send("Internal Server Error");
    }
}

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send("Please provide email and password");
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send("User not found");
        }

        const auth = await compare(password, user.password);

        if (!auth) {
            return res.status(401).send({ message: "Password is incorrect" });
        }

        res.cookie("jwt", createToken(email, user.id), {
            maxAge,
            secure: true,
            sameSite: "none"
        })

        return res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup,
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image,
                color: user.color
            }
        });
    } catch (error) {
        console.log({ error });
        return res.status(500).send("Internal Server Error");
    }
}

export const getUserInfo = async (req, res, next) => {
    try {

        const userData = await User.findById(req.userId);

        if (!userData) {
            return res.status(404).send("User not found");
        }

        return res.status(200).json({
            id: userData.id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color

        });
    } catch (error) {
        console.log({ error });
        return res.status(500).send("Internal Server Error");
    }
}

export const updateProfile = async (req, res, next) => {
    try {
        const { userId } = req;
        const { firstName, lastName, color } = req.body;

        if (!firstName || !lastName) {
            return res.status(400).send("Please provide firstName, lastName and color");
        }

        const userData = await User.findByIdAndUpdate(userId, {
            firstName,
            lastName,
            color,
            profileSetup: true
        }, { new: true, runValidators: true });

        return res.status(200).json({
            id: userData.id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color

        });
    } catch (error) {
        console.log({ error });
        return res.status(500).send("Internal Server Error");
    }
}

export const addProfileImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).send("Please provide profile image");
        }

        const date = Date.now();

        let fileName = "uploads/profiles/" + date + req.file.originalname;

        renameSync(req.file.path, fileName);

        const updatedUser = await User.findByIdAndUpdate(req.userId, {
            image: fileName
        }, { new: true, runValidators: true });

        return res.status(200).json({
            image: updatedUser.image,
        });
    } catch (error) {
        console.log({ error });
        return res.status(500).send("Internal Server Error");
    }
}

export const removeProfileImage = async (req, res, next) => {
    try {
        const { userId } = req;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send("User not found");
        }

        if (user.image) {
            try {
                if (existsSync(user.image)) {
                    unlinkSync(user.image);
                } else {
                    console.log("Image file not found:", user.image);
                }
            } catch (error) {
                console.error("Error deleting image file:", error);
            }
        }

        user.image = null;
        await user.save();

        return res.status(200).send("Profile Image removed successfully");
    } catch (error) {
        console.error("Error in removeProfileImage:", error);
        return res.status(500).send("Internal Server Error");
    }
};


export const logout = async (req, res, next) => {
    try {
        res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" })

        return res.status(200).send("Logout successfull")
    } catch (error) {
        console.log({ error });
        return res.status(500).send("Internal Server Error");
    }
}
