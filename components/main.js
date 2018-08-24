import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, Image, Button, StatusBar, Alert, ScrollView } from 'react-native';
import styles from './styles/main.style';
import firebase from 'react-native-firebase';
import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';
const FBSDK = require('react-native-fbsdk');
const defaultUser = require('./resources/default-user.png');
const { LoginButton, AccessToken } = FBSDK;

export default class main extends Component {

  //Set initial values to component's state =>
  state = {
    userPicture: defaultUser,
    userName: 'Stranger',
    fbLogged: false,
    googleLogged: false
  };

  //Handle facebook login =>
  _fbSignInHandler = (error, result) => {
    if (error) {
      console.log("login has error: " + result.error);
    } else if (result.isCancelled) {
      console.log("login is cancelled.");
    } else {
      AccessToken.getCurrentAccessToken().then(
        (data) => {
          // Create a new firebase credential with the token =>
          let credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken);
          // Login with credential=>
          firebase.auth().signInAndRetrieveDataWithCredential(credential);
          //Fetching the data from facebook via graph api using the granted accessToken
          return fetch(`https://graph.facebook.com/me?fields=name,picture&access_token=${data.accessToken}`)
            .then((response) => response.json())
            .then(data => {
              this.setState({
                userPicture: data.picture.data.url,
                userName: data.name, fbLogged: true
              });
            })
        })
    }
  }

  //Handle facebook logout =>
  _fbSignOutHandler = () => {
    this.setState({
      userPicture: defaultUser,
      userName: 'Stranger',
      fbLogged: false
    })

    //Handle signout from firebase's session
    firebase.auth().signOut();

  }

  //Google sign in handler =>
  _googleSignInHandler = () => {
    GoogleSignin.signIn()
      .then((user) => {
        // Create a new firebase credential with the token =>
        let credential = firebase.auth.GoogleAuthProvider.credential(user.idToken, user.accessToken)
        // Login with credential =>
        firebase.auth().signInAndRetrieveDataWithCredential(credential);

        //Change the state with google account's details =>
        this.setState({
          userName: user.user.name,
          userPicture: user.user.photo,
          googleLogged: true,
          fbLogged: false
        });
      })
      .catch((err) => {
        console.log('There was an error signing in ', err);
      })
      .done();
  };

  //Handles sign out confirmation for google account =>
  _googleSignOutConfirmation = () => {

    Alert.alert(
      'Log out?',
      'This action will log you out from the session.',
      [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'OK', onPress: () => this._googleSignOutHandler() },
      ],
      { cancelable: true }
    )
  }

  //Google sign out handler =>
  _googleSignOutHandler = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      this.setState({
        userName: "Stranger",
        userPicture: defaultUser,
        googleLogged: false
      });
    } catch (error) {
      console.error(error);
    }
    //Handle signout from firebase's session
    firebase.auth().signOut();
  };

  componentDidMount() {
    //Configure google's auth =>
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      webClientId: "271167611283-k99uftfbes22i4m33ffqc7013fmlkbr9.apps.googleusercontent.com"
    });
  }
  componentWillMount() {
    //Configuration of firebase 
    var config = {
      apiKey: "AIzaSyC80DkAz1GKnkdQCLVZeDfF91Bznc9fPoE",
      authDomain: "sociallogintask.firebaseapp.com",
      databaseURL: "https://sociallogintask.firebaseio.com",
      projectId: "sociallogintask",
      storageBucket: "sociallogintask.appspot.com",
      messagingSenderId: "271167611283"
    };

    /*Check if there is a logged client in the session
    if true - Set the state to client's details
    else - Default behaviour.     
    */
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        let flag=user.providerData[0].providerId == 'facebook.com';
          this.setState({
            userName: user.displayName,
            userPicture: user.photoURL,
            googleLogged: !flag,
            fbLogged: flag
          });
      }
    });
  }

  render() {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar
          backgroundColor="#3B5998"
          barStyle="light-content"
        />
        <View style={styles.titleView}>
          <Text style={styles.title}>Social Login</Text>
        </View>
        <View style={styles.container}>

          <View style={styles.greetView}>
            <Text style={styles.greetText}>Welcome {this.state.userName}!</Text>
          </View>

          <View style={styles.imageView}>
            {this.state.googleLogged || this.state.fbLogged

              ? <Image
                style={{ width: 100, height: 100, borderRadius: 50 }}
                source={{ uri: this.state.userPicture }} />

              : <Image
                style={{ width: 100, height: 100, borderRadius: 50 }}
                source={this.state.userPicture} />
            }

          </View>

          <View style={styles.buttonsView}>
            {/*Set facebook SDK login button 'onLoginFinished' and 'onLogoutFinished' methods*/}

            {!this.state.googleLogged
              ? (<LoginButton
                onLoginFinished={(error, result) => this._fbSignInHandler(error, result)}
                onLogoutFinished={() => this._fbSignOutHandler()} />) : null}

            {/* Show or hide google login/logout button by values in the state */}

            {!this.state.googleLogged && !this.state.fbLogged
              ? (<GoogleSigninButton
                style={{ width: 190, height: 38 }}
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={this._googleSignInHandler} />)
              : this.state.googleLogged ? (<Button title="Logout" color="orange" onPress={() => this._googleSignOutConfirmation()} />) : null
            }
          </View>
        </View>
      </ScrollView>
    );
  }
}

