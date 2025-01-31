// src/screens/GetStartedScreen.js
import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Image, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  Easing
} from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

// Define custom animation for the image
const floatingAnimation = {
  0: {
    transform: [{ translateY: 0 }, { scale: 1 }],
  },
  0.5: {
    transform: [{ translateY: -15 }, { scale: 1.02 }],
  },
  1: {
    transform: [{ translateY: 0 }, { scale: 1 }],
  },
};

const GetStartedScreen = () => {
  // useEffect(()=>{
  // navigation.reset(
  //   {
  //     index: 0,
  //     routes: [
  //       {
  //         name: 'Home',
  //         },
  //         ],
  //         },
  //         );
  //         },[]);


  const navigation = useNavigation();
  const { t } = useTranslation();
  
  // Animation values
  const arrowAnimation = new Animated.Value(0);
  const buttonScale = new Animated.Value(1);
  const imageAnimation = new Animated.Value(0);

  // Start arrow animation
  const startArrowAnimation = () => {
    Animated.sequence([
      Animated.timing(arrowAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(arrowAnimation, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => startArrowAnimation());
  };

  // Button press animations
  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    startArrowAnimation();
  }, []);

  // Interpolate arrow movement
  const arrowTranslateX = arrowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  return (
    <View style={styles.container}>
      {/* Top Left Logo */}
      <Animatable.View 
        animation="fadeIn" 
        duration={1000} 
        delay={300}
        style={styles.topLeft}
      >
        <Image
          source={require('../assets/images/logo2.png')}
          style={styles.roundedLogo}
          resizeMode="contain"
        />
      </Animatable.View>

      {/* Top Right Logo */}
      <Animatable.View 
        animation="fadeIn" 
        duration={1000} 
        delay={600}
        style={styles.topRight}
      >
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.roundedLogo}
          resizeMode="contain"
        />
      </Animatable.View>

      {/* Center Content */}
      <Animatable.View 
        animation="fadeIn" 
        duration={1200} 
        delay={900}
        style={styles.centerContent}
      >
        {/* Animated center image */}
        <Animatable.View
          animation={floatingAnimation}
          duration={3000}
          iterationCount="infinite"
          easing="ease-in-out"
        >
          <Image
            source={require('../assets/images/landing.png')}
            style={styles.teaLeaf}
            resizeMode="contain"
          />
        </Animatable.View>
        
        <Animatable.Text 
          animation="fadeInUp" 
          duration={1000} 
          delay={1200}
          style={styles.appName}
        >
          {t('Camellia')}
        </Animatable.Text>
      </Animatable.View>

      {/* Animated Get Started Button */}
      <Animatable.View 
        animation="fadeInUp" 
        duration={1000} 
        delay={1500}
        style={styles.buttonContainer}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('LanguageSelection')}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <Animated.View 
            style={[
              styles.button,
              { transform: [{ scale: buttonScale }] }
            ]}
          >
            <Text style={styles.buttonText}>{t('Get Started')}</Text>
            <Animated.View 
              style={[
                styles.arrowContainer,
                { transform: [{ translateX: arrowTranslateX }] }
              ]}
            >
              <Icon name="arrow-forward" size={24} color="#FFFFFF" />
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topLeft: {
    position: 'absolute',
    top:0,
    left: 10,
  },
  topRight: {
    position: 'absolute',
    top: 0,
    right: 10,
  },
  roundedLogo: {
    width: 100,
    height: 100,
    //eeeborderRadius: 50,
    overflow: 'hidden',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  teaLeaf: {
    width: width * 0.8,
    height: width * 0.8,
    maxWidth: 350,
    maxHeight: 350,
  },
  appName: {
    marginTop: 20,
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2E7D32',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  arrowContainer: {
    width: 24,
    height: 24,
  },
});

export default GetStartedScreen;