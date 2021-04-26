

import React, { useState } from "react";
import { storage, db } from "./firebase";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import firebase from "firebase";
import "./ImageUpload.css";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";

import { Avatar } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },

  large: {
    width: theme.spacing(6),
    height: theme.spacing(6),
  },
  
}));

export default function ImageUpload({ username }) {
  const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyBKM_qJm7k2kHhSA1GbGEXHNzQc6E8wfmQ",
    authDomain: "instagram-clone-react-70113.firebaseapp.com",
    databaseURL: "https://instagram-clone-react-70113.firebaseio.com",
    projectId: "instagram-clone-react-70113",
    storageBucket: "instagram-clone-react-70113.appspot.com",
    messagingSenderId: "375283177912",
    appId: "1:375283177912:web:ae590d1e7bf10a800b574d",
    measurementId: "G-GR8GZJQZ3L"

});
  const db = firebaseApp.firestore();
  const storage = firebase.storage();

  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [caption, setCaption] = useState("");

  const handleChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const fileType = file["type"];
      const validImageTypes = ["image/gif", "image/jpeg", "image/png"];
      if (validImageTypes.includes(fileType)) {
        setError("");
        setImage(file);
      } else {
        console.log("error");
        setError("error please upload a image file");
      }
    }
  };

  const handleUpload = () => {
    if (image) {
      // add to image folder in firebase
      const uploadTask = storage.ref(`images/${image.name}`).put(image);
      // Listen for state changes, errors, and completion of the upload.
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(progress);
        },
        (error) => {
          // error function ....
          console.log(error);
          setError(error);
        },
        () => {
          // complete function ....
          storage
            .ref("images")
            .child(image.name) // Upload the file and metadata
            .getDownloadURL() // get download url
            .then((url) => {
              setUrl(url);
              db.collection("posts").add({
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                caption: caption,
                imageUrl: url,
                username: username,
              });
              setProgress(0);
              setCaption("");
              setImage(null);
            });
        }
      );
    } else {
      setError("Error please choose an image to upload");
    }
  };

    const classes = useStyles();

  const fileInputRef = React.createRef();


  return (
    <div className="upload">
      <div className="upload_first">
        <Avatar
          className="post__avatar"
          alt="subhampreet"
          src="./images/avatar1.jpg"
          className = {classes.large}
        />
        <input
          type="text"
          placeholder="What's on your mind?"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          className="upload_caption"
        />
      </div>


      <div className="upload_content">
         <Button 
         onClick={() => fileInputRef.current.click()} 
         startIcon={<AddAPhotoIcon /> } 
         className = {classes.button}
         color = "primary"
         variant="contained"
         >
             Upload Photo
         </Button> 
        <input type="file" onChange={handleChange} hidden ref={fileInputRef} />
        

        <Button variant="contained" onClick={handleUpload} color="secondary"          className = {classes.button}
>
          Create Post
        </Button>
      </div>

      <br />

      <p style={{ color: "red" }}>{error}</p>
      {progress > 0 ? <center><progress value={progress} max="100" /></center> : ""}
    </div>
  );
}

// export default ImageUpload;
