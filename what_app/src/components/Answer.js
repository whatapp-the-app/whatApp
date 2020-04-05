import React from 'react';
import firebase from '../firebase'
import StarRatings from '../../node_modules/react-star-ratings';
import {Button} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Question from "./Question";

function StarRating(props) {
    return (
        <StarRatings
            rating={props.rating}
            starDimension={props.size}
            starSpacing="0px"
        />
    );
}

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        spacing: 10,
    },
}));


function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider).then(result => {

        const user = result.user;
        console.log(user.displayName)
        localStorage.setItem("user", user);
        localStorage.setItem("displayName", user.displayName);
        localStorage.setItem("photoUrl", user.photoURL);
        console.log(user)
        alert("hello " + user.displayName);
    })
}


function addComment(communicator, rating, text) {

    firebase.firestore().collection('comments').where('AppId', '==', communicator.id).where("displayName", '==', localStorage.getItem("displayName"))
        .onSnapshot((snapshot) => {
            const records = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }))
            if (records.length !== 0) {
                firebase.firestore().collection('comments').doc(records[0].id).update({
                    AppId: communicator.id,
                    rating: rating,
                    text: text,
                    displayName: localStorage.getItem("displayName"),
                    photoURL: localStorage.getItem("photoUrl"),
                    timestamp: Date.now()
                })
            } else {
                firebase.firestore().collection('comments').add({
                    AppId: communicator.id,
                    rating: rating,
                    text: text,
                    displayName: localStorage.getItem("displayName"),
                    photoURL: localStorage.getItem("photoUrl"),
                    timestamp: Date.now()
                })
            }

        });
    console.log(localStorage.getItem("displayName"));
    console.log(localStorage.getItem("photoUrl"))
}

function googleLogout() {
    firebase.auth().signOut();
    localStorage.removeItem("user");
}

function Answer(props) {
    const [ratings] = React.useState(props.ratings);
    const [comments, setComments] = React.useState(null);

    const [communicators] = React.useState(props.communicators);
    const [allCommunicators] = React.useState(props.allCommunicators);
    const [questions] = React.useState(props.questions);

    const [hideButton, setHideButton] = React.useState(null);
    const [restartApp, setRestart] = React.useState(false);

    const [loggedIn, setLoggedIn] = React.useState(localStorage.getItem("user") == null);

    function loadComments(appID, key) {
        firebase
            .firestore().collection('comments').where("AppId", "==", appID)
            .onSnapshot((snapshot) => {
                const records = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setComments(records);
            });
        setHideButton(key);
    }

    return (<>
            {restartApp ? <Question questions={questions} communicators={allCommunicators}/> :
                <div>
                    <p>Your answer n-boy</p>

                    {loggedIn === false && <button onClick={() => {
                        setHideButton(null);
                        setLoggedIn(true);
                        googleLogin()
                    }}>log in to leave a comment</button>}

                    {loggedIn && <button onClick={() => {
                        setLoggedIn(false);
                        googleLogout()
                    }}>log out</button>}
                    {communicators.map((communicator, key) => {
                        return (
                            <div key={key}>
                                <p>name: {communicator.name}</p>
                                <StarRating rating={ratings[communicator.id]}/>
                                {hideButton !== key &&
                                <button onClick={() => loadComments(communicator.id, key)}>load comments</button>}
                                {hideButton === key && comments != null && comments.map((comment, key2) => {
                                    return (<p key={key2}>{comment.text}</p>)
                                })}
                                {localStorage.getItem("user") != null && hideButton === key &&
                                <button onClick={() => addComment(communicator, 4, "lol")}>submit rating</button>}
                                {hideButton === key &&
                                <button onClick={() => setHideButton(null)}>hide comments</button>}
                            </div>)
                    })}

                    <button onClick={() => setRestart(true)}>Let's try again...</button>
                </div>}
        </>
    )

}

export default Answer