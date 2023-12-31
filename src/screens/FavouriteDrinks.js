import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Image,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import firebase from "../../config/firebase";

const screenWidth = Dimensions.get("window").width;
const numColumns = 2;
const tileSize = screenWidth / numColumns;

const FavouriteDrinks = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [empty, setEmpty] = useState(false);
  const [userId, setUserId] = useState();
  const [drinks, setDrinks] = useState([]);
  const isFocused = useIsFocused();

  const fetchUserId = () => {
    const userId = firebase.auth().currentUser.uid;
    setUserId(userId);
    return userId;
  };

  const fetchFavouriteDrinksIds = async (userId) => {
    const snapshot = await firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .get();

    return snapshot.data().favourites;
  };

  const fetchFavouriteDrinks = async (drinksIds) => {
    const drinks = [];

    if (drinksIds.length !== 0) {
      const snapshot = await firebase
        .firestore()
        .collection("drinks")
        .where(firebase.firestore.FieldPath.documentId(), "in", drinksIds)
        .get();

      snapshot.forEach((doc) => {
        const { hex, category, description, name, imgUrl, ingredients } =
          doc.data();

        console.log(doc.data());

        drinks.push({
          id: doc.id,
          hex,
          category,
          description,
          name,
          imgUrl,
          ingredients,
        });
      });
    } else {
      setEmpty(true);
    }

    setDrinks(drinks);
    setIsLoading(false);
  };

  const fetchData = async () => {
    const userId = fetchUserId();
    const favouriteIds = await fetchFavouriteDrinksIds(userId);
    const favouriteDrinksObjects = await fetchFavouriteDrinks(favouriteIds);
  };

  useEffect(() => {
    fetchData();
  }, [isFocused]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ffcc00" />
      </View>
    );
  }

  return (
    <SafeAreaView>
      <FlatList
        ListHeaderComponent={
          <View>
            <Image
              source={require("../../assets/images/favourites.jpg")}
              style={styles.headerImage}
            />
            <View style={styles.textView}>
              <Text style={styles.titleText}>Favourites</Text>
            </View>
            {empty ? (
              <Text style={styles.emptyText}>Empty favourites</Text>
            ) : null}
          </View>
        }
        data={drinks}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ overflow: "hidden" }}
            onPress={() => {
              navigation.navigate("ItemDetail", {
                ...item,
              });
            }}
          >
            <ImageBackground style={styles.item} source={{ uri: item.imgUrl }}>
              <Text style={styles.categoryText}>{item.name}</Text>
            </ImageBackground>
          </TouchableOpacity>
        )}
        numColumns={2}
        keyExtractor={(item, index) => { return item.hex}}
      />
    </SafeAreaView>
  );
};

export default FavouriteDrinks;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "white",
  },
  image: {
    flexGrow: 1,
    height: Dimensions.get("window").width / numColumns,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  headerImage: {
    height: 300,
    flex: 1,
    width: null,
  },
  categoryText: {
    position: "absolute",
    textAlign: "center",
    fontSize: 20,
    color: "black",
    textTransform: "capitalize",
  },
  item: {
    backgroundColor: "#313638",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: Dimensions.get("window").width / numColumns - 2,
    width: Dimensions.get("window").width / numColumns - 2,
    margin: 1,
  },
  textView: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  titleText: {
    fontSize: 30,
    color: "white",
  },
  emptyText: {
    backgroundColor: "grey",
    borderRadius: 5,
    margin: 1,
    paddingBottom: 5,
    paddingTop: 5,
    textAlign: "center",
    fontWeight: "bold",
  },
});
