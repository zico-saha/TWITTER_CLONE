require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const easyinvoice = require('easyinvoice');
const fs = require('fs');
const Razorpay = require('razorpay');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const postCollection = client.db('database').collection('posts');
        const userCollection = client.db('database').collection('users');
        const badgeCollection = client.db('database').collection('badges');
        const loginInfoCollection = client.db('database').collection('loginInfo');

        // Get routes
        app.get('/post', async (req, res) => {
            const post = (await postCollection.find().toArray()).reverse();
            res.send(post);
        });

        app.get('/user', async (req, res) => {
            const user = await userCollection.find().toArray();
            res.send(user);
        });

        app.get('/loggedInUser', async (req, res) => {
            const email = req.query.email;
            const user = await userCollection.find({ email: email }).toArray();
            res.send(user);
        });

        app.get('/userPost', async (req, res) => {
            const email = req.query.email;
            const post = (await postCollection.find({ email: email }).toArray()).reverse();
            res.send(post);
        });

        app.get('/userBadges', async (req, res) => {
            const email = req.query.email;
            const badges = await badgeCollection.find({ email: email }).toArray();
            res.send(badges);
        });

        app.get('/user/language', async (req, res) => {
            const email = req.query.email;
            const user = await userCollection.findOne({ email: email });
            if (user && user.language) {
                res.json({ language: user.language });
            } else {
                res.json({ language: 'en' });
            }
        });

        // Post routes
        app.post('/post', async (req, res) => {
            const videoExists = req.body.video && req.body.video.trim() !== "";

            const d_upvote = (videoExists) ? 1 : 0;
            const newPost = { ...req.body, liked: [], upvotes: d_upvote };
            const result = await postCollection.insertOne(newPost);

            const userUpdate = await userCollection.updateOne(
                { email: newPost.email },
                { $inc: { postCount: 1, points: 2, upvotes: d_upvote } }
            );

            const user = await userCollection.findOne({ email: newPost.email });
            const followerCount = user.followers ? user.followers.length : 0;
            await checkAndAssignBadges(user.email, user.postCount, user.upvotes, followerCount);

            res.send(result);
        });

        app.post('/register', async (req, res) => {
            try {
                let currentDate = new Date();
                let expiry = new Date();
                expiry.setMonth(expiry.getMonth() + 1);

                const { email, name, username, userInfo } = req.body;

                const user = {
                    email: email,
                    name: name,
                    username: username,
                    upvotes: 0,
                    points: 0,
                    followers: [],
                    following: [],
                    language: "en",
                    plan: 'basic',
                    post_remains: 20,
                    expiryDate: expiry,
                    last_device: userInfo.device,
                    last_browser: userInfo.browser,
                    last_os: userInfo.os,
                    last_ip: userInfo.ip,
                    last_login_timestamp: currentDate,
                };

                const result = await userCollection.insertOne(user);
                res.send(result);
            } catch (error) {
                res.status(500).send('Error during registration');
            }
        });

        // Patch routes
        app.patch('/userUpdates/:email', async (req, res) => {
            const filter = { email: req.params.email };
            const profile = req.body;
            const options = { upsert: true };
            const updateDoc = { $set: profile };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        app.patch('/likePost/:postId', async (req, res) => {
            const { postId } = req.params;
            const { postEmail, likedByEmail } = req.body;

            const post = await postCollection.findOne({ _id: new ObjectId(postId) });
            const isLiked = post.liked.includes(likedByEmail);

            if (isLiked) {
                await postCollection.updateOne(
                    { _id: new ObjectId(postId) },
                    {
                        $pull: { liked: likedByEmail },
                        $inc: { upvotes: -1 }
                    }
                );

                await userCollection.updateOne(
                    { email: postEmail },
                    {
                        $inc: {
                            upvotes: -1,
                            points: -1
                        }
                    }
                );
            } else {
                await postCollection.updateOne(
                    { _id: new ObjectId(postId) },
                    {
                        $push: { liked: likedByEmail },
                        $inc: { upvotes: 1 }
                    }
                );

                await userCollection.updateOne(
                    { email: postEmail },
                    {
                        $inc: {
                            upvotes: 1,
                            points: 1
                        }
                    }
                );
            }

            const user = await userCollection.findOne({ email: postEmail });

            // Use optional chaining to handle undefined followers array
            const followersCount = user.followers?.length || 0;

            await checkAndAssignBadges(user.email, user.postCount, user.upvotes, followersCount);

            res.send({ success: true });
        });

        app.patch('/followUser/:email', async (req, res) => {
            const { email } = req.params;
            const { followerEmail } = req.body;

            try {
                const user = await userCollection.findOne({ email: email });

                if (!user) {
                    return res.status(404).send('User not found');
                }

                const followers = user.followers || [];
                const following = user.following || [];

                const isFollowing = followers.includes(followerEmail);

                let followedUser, followerUser;

                if (isFollowing) {
                    // Unfollow user
                    followedUser = await userCollection.updateOne(
                        { email: email },
                        { $pull: { followers: followerEmail } }
                    );

                    followerUser = await userCollection.updateOne(
                        { email: followerEmail },
                        { $pull: { following: email } }
                    );
                } else {
                    // Follow user
                    followedUser = await userCollection.updateOne(
                        { email: email },
                        { $addToSet: { followers: followerEmail } }
                    );

                    followerUser = await userCollection.updateOne(
                        { email: followerEmail },
                        { $addToSet: { following: email } }
                    );
                }

                const updatedUser = await userCollection.findOne({ email: email });
                await checkAndAssignBadges(updatedUser.email, updatedUser.postCount, updatedUser.upvotes, updatedUser.followers.length);

                res.send({ followedUser, followerUser });
            } catch (error) {
                console.error("Error updating follow status:", error);
                res.status(500).send('Internal Server Error');
            }
        });

        app.post('/transferPoints', async (req, res) => {
            const { senderEmail, receiverEmail } = req.body;

            try {
                const sender = await userCollection.findOne({ email: senderEmail });
                const receiver = await userCollection.findOne({ email: receiverEmail });

                if (!sender || !receiver) {
                    return res.status(404).send('Sender or receiver not found');
                }

                if (sender.points < 2) {
                    return res.status(400).send({ message: 'Insufficient points to transfer' });
                }

                const lastTransferDate = new Date(sender.lastTransferDate);
                const today = new Date();

                // Check if the transfer was already done today
                if (lastTransferDate.toDateString() === today.toDateString()) {
                    return res.status(400).send({ message: 'You can only transfer points once a day' });
                }

                // Proceed with the point transfer
                const updatedSender = await userCollection.updateOne(
                    { email: senderEmail },
                    {
                        $inc: { points: -2 },
                        $set: { lastTransferDate: today.toISOString() }
                    }
                );

                const updatedReceiver = await userCollection.updateOne(
                    { email: receiverEmail },
                    { $inc: { points: 2 } }
                );

                res.send({ updatedSender, updatedReceiver });
            } catch (error) {
                console.error('Error transferring points:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        async function checkAndAssignBadges(email, postCount, upvotes, followerCount) {
            let badgesToAssign = [];

            if (postCount >= 5) {
                badgesToAssign.push('5_posts_badge');
            }
            if (postCount >= 100) {
                badgesToAssign.push('100_posts_badge');
            }

            if (upvotes >= 100) {
                badgesToAssign.push('100_likes_badge');
            }

            if (followerCount >= 1) {
                badgesToAssign.push('1_follower_badge');
            }

            for (const badge of badgesToAssign) {
                const badgeExists = await badgeCollection.findOne({ email, badge });
                if (!badgeExists) {
                    await badgeCollection.insertOne({ email, badge });
                }
            }
        }

        app.post('/login', async (req, res) => {
            const { email, userInfo } = req.body;
            const loginInfo = {
                email,
                browser: userInfo.browser,
                os: userInfo.os,
                device: userInfo.device,
                ip: userInfo.ip,
                timestamp: new Date(),
            };

            try {
                // Save login info to loginInfoCollection
                await loginInfoCollection.insertOne(loginInfo);

                // Update last login info in userCollection
                const result = await userCollection.updateOne(
                    { email: email },
                    {
                        $set: {
                            last_browser: userInfo.browser,
                            last_os: userInfo.os,
                            last_device: userInfo.device,
                            last_ip: userInfo.ip,
                            last_login_timestamp: new Date()
                        }
                    }
                );

                res.send(result);
            } catch (error) {
                console.error('Error logging in:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        app.post('/payment', async (req, res) => {
            try {
                const razorpay = new Razorpay({
                    key_id: process.env.RAZORPAY_KEY_ID,
                    key_secret: process.env.RAZORPAY_KEY_SECRET,
                });

                const options = req.body;
                const order = await razorpay.orders.create(options);

                if (!order) {
                    return res.status(400).send("Bad Request");
                }
                res.json(order);

            } catch (error) {
                console.log(error);
                res.status(500).send(error);
            }
        })

        const updateUserPlan = async (email, plan) => {
            let post_remains = 0;
            let date = new Date();
            let expiryDate = null;
            switch (plan) {
                case 'monthly':
                    post_remains = 50;
                    expiryDate = new Date(date.setMonth(date.getMonth() + 1));
                    break;
                case 'yearly':
                    post_remains = 700;
                    expiryDate = new Date(date.setFullYear(date.getFullYear() + 1));
                    break;
                case 'basic':
                default:
                    post_remains = 20;
                    expiryDate = new Date(date.setMonth(date.getMonth() + 1));
            }

            await userCollection.updateOne(
                { email },
                { $set: { plan, post_remains, expiryDate } }
            );
        };

        app.post('/paymentSuccess', async (req, res) => {
            const { email, plan } = req.body;

            try {
                await sendInvoice(email, plan);
                await updateUserPlan(email, plan);

                res.status(200).send('Payment success and plan updated successfully');
            } catch (error) {
                console.error('Error updating user plan after payment:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        async function sendInvoice(email, plan) {
            try {
                const logoBase64 = fs.readFileSync('image/Twitter_Image_logo.png', { encoding: 'base64' });
                const invoiceData = {
                    "documentTitle": "INVOICE",
                    "currency": "INR",
                    "marginTop": 20,
                    "marginBottom": 20,
                    "marginLeft": 20,
                    "marginRight": 20,
                    "logo": `data:image/png;base64,${logoBase64}`,
                    "sender": {
                        "company": "Twitter Clone",
                        "address": "",
                        "city": "Kolkata",
                        "country": "India"
                    },
                    "client": { "company": email },
                    "invoiceNumber": "2024.0001",
                    "invoiceDate": new Date().toLocaleDateString(),
                    "products": [
                        {
                            "quantity": 1,
                            "description": `${plan} Subscription`,
                            "price": plan === 'yearly' ? 4999.00 : 499.00
                        }
                    ],
                    "bottomNotice": "Thank you for your purchase!"
                };

                const invoicePdf = await easyinvoice.createInvoice(invoiceData);

                const transporter = nodemailer.createTransport({
                    service: 'gmail', // Use your email service
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'Subscription Invoice',
                    text: 'Thank you for your payment! Please find the invoice attached.',
                    attachments: [
                        {
                            filename: 'invoice.pdf',
                            content: invoicePdf.pdf,
                            encoding: 'base64'
                        }
                    ]
                };

                await transporter.sendMail(mailOptions);

            } catch (error) {
                console.error('Error sending invoice:', error);
                throw new Error('Invoice sending failed');
            }
        }

        app.post('/downgradePlan', async (req, res) => {
            const { email } = req.body;
            try {
                const currentDate = new Date();
                const expiryDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));

                await userCollection.updateOne(
                    { email },
                    { $set: { plan: 'basic', post_remains: 20, expiryDate: expiryDate } }
                );
                res.status(200).send('Plan downgraded successfully');
            } catch (error) {
                console.error('Error downgrading plan:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        app.get('/user/postRemains', async (req, res) => {
            const email = req.query.email;
            try {
                const user = await userCollection.findOne({ email: email }, { projection: { post_remains: 1 } });
                if (user) {
                    res.send({ post_remains: user.post_remains });
                } else {
                    res.status(404).send({ message: "User not found" });
                }
            } catch (error) {
                console.error('Error fetching post remains:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        app.post('/user/decrementPostRemains', async (req, res) => {
            const { email } = req.body;
            try {
                const result = await userCollection.updateOne(
                    { email: email },
                    { $inc: { post_remains: -1 } }
                );
                if (result.modifiedCount > 0) {
                    res.send({ message: 'Post remains decremented' });
                } else {
                    res.status(404).send({ message: 'User not found or no changes made' });
                }
            } catch (error) {
                console.error('Error decrementing post remains:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        app.post('/otp', async (req, res) => {
            const { email } = req.body;
            const otp = crypto.randomInt(100000, 999999).toString();

            var transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            var mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'OTP Verification Code',
                text: `Please use the verification code\n${otp}\n\nIf you didn't request this, you can ignore this email.\n\n`
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    res.status(500).send('Error sending OTP');
                } else {
                    res.status(200).json({ otp });
                }
            });
        });

        await client.db("admin").command({ ping: 1 });
    } catch (error) {
        console.log(error);
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello from Twitter!');
});

app.listen(port, () => {
    console.log(`Twitter is listening on port ${port}`);
});
