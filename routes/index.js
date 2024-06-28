const { firebaseDb, firebaseStorage } = require("../lib/firebase");
const {
  collection,
  getDocs,
  where,
  doc,
  deleteDoc,
  query,
  updateDoc,
} = require("firebase/firestore");
const { ref, deleteObject, listAll } = require("firebase/storage");
var nodemailer = require("nodemailer");
var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("login");
});

router.post("/login", function (req, res, next) {
  if (req.body.email === "admin@admin.com" && req.body.password === "admin") {
    res.redirect("/home?tab=newRequests");
  } else {
    res.send("login failed");
  }
});

router.get("/home", async function (req, res, next) {
  const tab = req.query.tab;
  try {
    let data = [];
    if (tab === "newRequests") {
      const newRequestsRef = collection(firebaseDb, "verificationData");
      const snapshot = await getDocs(newRequestsRef);
      snapshot.docs.forEach((doc) => {
        const requestDate = doc.data().createdAt.toDate();
        const formattedDate =
          String(requestDate.getDate()).padStart(2, "0") +
          "-" +
          String(requestDate.getMonth() + 1).padStart(2, "0") +
          "-" +
          requestDate.getFullYear();
        data.push({
          userId: doc.id,
          userName: doc.data().fullName,
          country: doc.data().country,
          email: doc.data().email,
          phone: doc.data().phone,
          requestDate: formattedDate,
          dob: doc.data().dob,
          backImgURL: doc.data().backImgURL,
          frontImgURL: doc.data().frontImgURL,
          selfieImgURL: doc.data().selfieImgURL,
          nationaId: doc.data().nationalID,
        });
      });
    } else if (tab === "verified") {
      const verifiedRef = collection(firebaseDb, "users");
      const q = query(verifiedRef, where("isVerified", "==", true));
      const snapshot = await getDocs(q);
      snapshot.docs.forEach((doc) => {
        const verificationDate = doc.data().verificationDate.toDate();
        const formattedDate =
          String(verificationDate.getDate()).padStart(2, "0") +
          "-" +
          String(verificationDate.getMonth() + 1).padStart(2, "0") +
          "-" +
          verificationDate.getFullYear();
        data.push({
          userId: doc.data().uid,
          userName: doc.data().name,
          country: doc.data().country,
          email: doc.data().email,
          phone: doc.data().phnNumber,
          verificationDate: formattedDate,
          dob: doc.data().dob,
          nationaId: doc.data().nationalID,
        });
      });
    } else if (tab == "rejected") {
      const rejectedRef = collection(firebaseDb, "users");
      const q = query(
        rejectedRef,
        where("verificationStatus", "==", "rejected")
      );
      const snapshot = await getDocs(q);
      snapshot.docs.forEach((doc) => {
        const verificationDate = doc.data().verificationDate.toDate();
        const formattedDate =
          String(verificationDate.getDate()).padStart(2, "0") +
          "-" +
          String(verificationDate.getMonth() + 1).padStart(2, "0") +
          "-" +
          verificationDate.getFullYear();
        data.push({
          userId: doc.data().uid,
          userName: doc.data().name,
          country: doc.data().country,
          email: doc.data().email,
          phone: doc.data().phnNumber,
          verificationDate: formattedDate,
          dob: doc.data().dob,
          nationaId: doc.data().nationalID,
        });
      });
    }

    res.render("home", { tab, data });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error retrieving data");
  }
});

router.get("/verify", function (req, res, next) {
  const { id, country, dob, nationalID, email } = req.query;
  const userRef = collection(firebaseDb, "users");
  const q = query(userRef, where("uid", "==", id));

  getDocs(q)
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        res.send("User does not exist");
      } else {
        const userDoc = querySnapshot.docs[0];

        return updateDoc(userDoc.ref, {
          isVerified: true,
          verificationStatus: "",
          country: country,
          dob: dob,
          email: email,
          nationalID: nationalID,
          verificationDate: new Date(),
        }).then(() => {
          const folderRef = ref(firebaseStorage, `VerificationImages/${id}`);
          return listAll(folderRef)
            .then((result) => {
              const deletePromises = result.items.map((itemRef) => {
                return deleteObject(itemRef);
              });
              return Promise.all(deletePromises);
            })
            .then(async () => {
              const verificationDataRef = doc(
                collection(firebaseDb, "verificationData"),
                id
              );
              await deleteDoc(verificationDataRef);
              sendMail(true, email);
              res.redirect("/home?tab=newRequests");
            })
            .catch((error) => {
              console.error("Error deleting folder contents:", error);
              res.status(500).send("Error deleting folder contents");
            });
        });
      }
    })
    .catch((error) => {
      console.error("Error checking user existence: ", error);
      res.status(500).send("Error checking user existence");
    });
});

router.get("/reject", function (req, res, next) {
  const { id, email } = req.query;
  const userRef = collection(firebaseDb, "users");
  const q = query(userRef, where("uid", "==", id));

  getDocs(q)
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        res.send("User does not exist");
      } else {
        const userDoc = querySnapshot.docs[0];

        return updateDoc(userDoc.ref, {
          isVerified: false,
          verificationStatus: "rejected",
          verificationDate: new Date(),
        }).then(() => {
          const folderRef = ref(firebaseStorage, `VerificationImages/${id}`);
          return listAll(folderRef)
            .then((result) => {
              const deletePromises = result.items.map((itemRef) => {
                return deleteObject(itemRef);
              });
              return Promise.all(deletePromises);
            })
            .then(async () => {
              const verificationDataRef = doc(
                collection(firebaseDb, "verificationData"),
                id
              );
              await deleteDoc(verificationDataRef);
              sendMail(false, email);
              res.redirect("/home?tab=newRequests");
            })
            .catch((error) => {
              console.error("Error deleting folder contents:", error);
              res.status(500).send("Error deleting folder contents");
            });
        });
      }
    })
    .catch((error) => {
      console.error("Error checking user existence: ", error);
      res.status(500).send("Error checking user existence");
    });
});

router.get("/settings", function (req, res, next) {
  res.send("settings");
});

router.get("/logout", function (req, res, next) {
  res.redirect("/");
});

const sendMail = async (verified, receiver) => {
  let testAccount = nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "brett22@ethereal.email",
      pass: "K7jfhFyE8G5E1mmgbU",
    },
  });

  var subject = verified ? "Verification Approved" : "Verification Rejected";
  var text = verified
    ? "Your verification request has been approved. Please Log In again to get Full Experience."
    : "Your verification request has been rejected";

  let info = await transporter.sendMail({
    from: "Healr <support.healr@mail.com>",
    to: receiver,
    subject: subject,
    text: text,
  });
  console.log("Message sent: %s", info.messageId);
};

module.exports = router;
