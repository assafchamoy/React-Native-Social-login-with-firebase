import React from 'react';
import {StyleSheet} from 'react-native';
export default StyleSheet.create({
    title: {
        color: 'white',
        fontSize: 50,
        fontFamily: 'helvetica',
        textAlign: "center",
        height: 80
      },
      titleView: {
        backgroundColor: '#4285f4',
        width: '100%'
      },
    
      buttonsView: {
        width: '100%',
        flexDirection: 'row',
        alignItems:'center'
    
      },
    
      greetView: {
        marginTop: 150,
        padding: 20,
        alignItems: 'center'
      },
      greetText: {
        fontSize: 20
      },
    
      container: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'space-around'
      },
    
      imageView: {
        marginBottom: 90
    
      },
      
  });