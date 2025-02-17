// WeatherForecastScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const PRIMARY_COLOR = "#4CAF50";
const API_KEY = "8cf62faa46f163cabb513fb54b5bcc50"; // <--- Replace with your real key

// Example lat/lon
const DEFAULT_LAT = -6.2419;
const DEFAULT_LON = 106.9923;

const WeatherForecastScreen = () => {
  const [unitMenuVisible, setUnitMenuVisible] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("metric");
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecastList, setForecastList] = useState([]);
  const [next4Days, setNext4Days] = useState([]);
  const [pesticideMessage, setPesticideMessage] = useState("");
  const [extraInfoMessage, setExtraInfoMessage] = useState(
    "Rainy weather is predicted to occur in the next few days. Thursday is a bad day to apply pesticides."
  );

  useEffect(() => {
    fetchCurrentWeather();
    fetchForecast();
  }, [selectedUnit]);

  // --- FETCHING LOGIC ---
  const fetchCurrentWeather = async () => {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${DEFAULT_LAT}&lon=${DEFAULT_LON}&units=${selectedUnit}&appid=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data?.weather) {
        setCurrentWeather(data);
        setPesticideMessage(getPesticideMessage(data));
      } else {
        setCurrentWeather(null);
      }
    } catch (error) {
      console.error("Error fetching current weather:", error);
    }
  };

  const fetchForecast = async () => {
    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${DEFAULT_LAT}&lon=${DEFAULT_LON}&units=${selectedUnit}&appid=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data?.list) {
        setForecastList(data.list);
      } else {
        setForecastList([]);
      }
    } catch (error) {
      console.error("Error fetching forecast:", error);
    }
  };

  useEffect(() => {
    if (forecastList.length === 0) {
      setNext4Days([]);
      return;
    }
    const grouped = groupForecastByDate(forecastList);

    const todayStr = new Date().toISOString().split("T")[0];
    const dayKeys = Object.keys(grouped)
      .filter((d) => d >= todayStr)
      .sort()
      .slice(0, 4);

    const result = dayKeys.map((dateStr) => {
      const items = grouped[dateStr];
      const midIndex = Math.floor(items.length / 2);
      const midItem = items[midIndex] || items[0];

      const temps = items.map((f) => f.main.temp);
      const humids = items.map((f) => f.main.humidity);
      const avgTemp = temps.reduce((s, v) => s + v, 0) / temps.length;
      const avgHumid = humids.reduce((s, v) => s + v, 0) / humids.length;

      return {
        date: dateStr,
        icon: midItem.weather[0].main,
        temp: avgTemp,
        humidity: avgHumid,
      };
    });
    setNext4Days(result);
  }, [forecastList]);

  // --- HELPERS ---
  const groupForecastByDate = (list) => {
    const result = {};
    list.forEach((item) => {
      const dateStr = item.dt_txt.split(" ")[0];
      if (!result[dateStr]) {
        result[dateStr] = [];
      }
      result[dateStr].push(item);
    });
    return result;
  };

  const getPesticideMessage = (data) => {
    if (!data || !data.main) return "";
    const { main, wind, weather } = data;
    const condition = weather[0].main.toLowerCase();
    const temp = main.temp;
    const windSpeed = wind.speed;
    const humidity = main.humidity;

    // Example logic: no rain, wind < 5, 15<=temp<=30, humidity < 90
    const noRain =
      !condition.includes("rain") && !condition.includes("drizzle");
    const windOk = windSpeed < 5;
    const tempOk = temp >= 15 && temp <= 30;
    const humidityOk = humidity < 90;

    if (noRain && windOk && tempOk && humidityOk) {
      return "Today is a good day to apply pesticides.";
    } else {
      return "Today may not be ideal for pesticides. Check conditions.";
    }
  };

  const formatTodayDate = () => {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getWeatherIcon = (weatherMain) => {
    const icons = {
      Clear: "weather-sunny",
      Clouds: "weather-cloudy",
      Rain: "weather-rainy",
      Snow: "weather-snowy",
      Thunderstorm: "weather-lightning",
      Drizzle: "weather-pouring",
    };
    return icons[weatherMain] || "weather-partly-cloudy";
  };

  const formatDayDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // --- UNIT MENU ---
  const openUnitMenu = () => setUnitMenuVisible(true);
  const closeUnitMenu = () => setUnitMenuVisible(false);

  const handleSelectUnit = (label) => {
    if (label === "Celsius") setSelectedUnit("metric");
    if (label === "Fahrenheit") setSelectedUnit("imperial");
    if (label === "Kelvin") setSelectedUnit("standard");
    closeUnitMenu();
  };

  const getUnitSymbol = () => {
    if (selectedUnit === "metric") return "C";
    if (selectedUnit === "imperial") return "F";
    return "K";
  };

  // --- RENDER ---
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Todays Weather</Text>
          <TouchableOpacity onPress={openUnitMenu}>
            <Icon name="dots-vertical" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Unit Menu Modal */}
        <Modal
          visible={unitMenuVisible}
          transparent
          animationType="fade"
          onRequestClose={closeUnitMenu}
        >
          <TouchableOpacity style={styles.modalOverlay} onPress={closeUnitMenu}>
            <View style={styles.menuContainer}>
              {["Celsius", "Fahrenheit", "Kelvin"].map((label) => (
                <TouchableOpacity
                  key={label}
                  style={styles.menuItem}
                  onPress={() => handleSelectUnit(label)}
                >
                  <Text style={styles.menuItemText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Current Weather Card */}
        {currentWeather && (
          <View style={styles.todayCard}>
            <Text style={styles.locationText}>
              {currentWeather.name}, {formatTodayDate()}
            </Text>
            <Text style={styles.temperatureText}>
              {Math.round(currentWeather.main.temp)}°{getUnitSymbol()}
            </Text>
            <Text style={styles.humidityText}>
              Humidity {currentWeather.main.humidity}%
            </Text>
            <Text style={styles.adviceText}>{pesticideMessage}</Text>
          </View>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardText}>{extraInfoMessage}</Text>
        </View>

        {/* Next 4 Days */}
        <Text style={styles.nextDaysTitle}>Next 4 Days</Text>

        {/* 
          We want 2 columns. We'll use flexDirection row + wrap.
          Each dayCard is 48% width so 2 fit side-by-side.
        */}
        <View style={styles.daysContainer}>
          {next4Days.length === 0 && (
            <Text style={{ textAlign: "center", color: "#999", marginTop: 10 }}>
              No data available yet.
            </Text>
          )}
          {next4Days.map((item, index) => {
            const iconName = getWeatherIcon(item.icon);
            return (
              <View key={index} style={styles.dayCard}>
                <Icon name={iconName} size={36} color={PRIMARY_COLOR} />
                <Text style={styles.dayDateText}>
                  {formatDayDate(item.date)}
                </Text>
                <Text style={styles.dayTempText}>
                  {Math.round(item.temp)}°{getUnitSymbol()}
                </Text>
                <Text style={styles.dayHumidityText}>
                  Humidity {Math.round(item.humidity)}%
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WeatherForecastScreen;

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    width: 200,
    paddingVertical: 8,
  },
  menuItem: {
    padding: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
  },
  // Today Card
  todayCard: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    height: 140,
    justifyContent: "space-around",
  },
  locationText: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "500",
  },
  temperatureText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFF",
  },
  humidityText: {
    fontSize: 14,
    color: "#FFF",
    marginBottom: 4,
  },
  adviceText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#FFF",
  },
  // Info Card
  infoCard: {
    backgroundColor: "#EEF1F3",
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
  },
  infoCardText: {
    fontSize: 14,
    color: "#555",
  },
  // Next 4 Days
  nextDaysTitle: {
    marginTop: 20,
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
    marginHorizontal: 16,
  },
  dayCard: {
    // "Backdrop" style: partially transparent
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2, // Android shadow
    alignItems: "center",
    // 2 columns => each ~48% wide with spacing
    width: "48%",
  },
  dayDateText: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  dayTempText: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  dayHumidityText: {
    marginTop: 2,
    fontSize: 14,
    color: "#666",
  },
});
