const { firebaseDb } = require("../lib/firebase");
const { collection, getDocs } = require("firebase/firestore");

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
          // email: doc.data().email,
          // phone: doc.data().phone,
          requestDate: formattedDate,
          dob: doc.data().dob,
          backImgURL: doc.data().backImgURL,
          frontImgURL: doc.data().frontImgURL,
          selfieImgURL: doc.data().selfieImgURL,
          nationaId: doc.data().nationalID,
        });
      });
      console.log(data);
    } else if (tab === "otherTab") {
    } else {
      data = [];
    }

    res.render("home", { tab, data });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error retrieving data");
  }
});

router.get("/settings", function (req, res, next) {
  res.send("settings");
});

router.get("/logout", function (req, res, next) {
  res.redirect("/");
});

module.exports = router;
