import React, { useState, useEffect } from 'react';
import '../style/global.css';
import { ColorPicker } from 'antd';

const WeatherDashboard = () => {
    const [city, setCity] = useState('Hồ Chí Minh');
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState([]);

    const [loading, setLoading] = useState(true);
    const [daysToShow, setDaysToShow] = useState(5);
    const [reload, setReload] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState('');


    useEffect(() => {
        fetchWeatherData(daysToShow);
    }, [city, reload]);

    const fetchWeatherData = async (days) => {
        setLoading(true);
        try {
            const apiKey = 'ca1510b9fee441738ad114601241107';
            const weatherResponse = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`);
            const weather = await weatherResponse.json();
            setWeatherData(weather.current);

            const forecastResponse = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=${days}`);
            const forecast = await forecastResponse.json();

            setForecastData(prevForecastData => [...prevForecastData, ...forecast.forecast.forecastday.slice(1, days)]);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (current = false) => {
        setDaysToShow(0)
        if (current) {
            setCity("Hồ Chí Minh");
        } else {
            const cityInput = document.querySelector('.search-box input').value;
            setCity(cityInput);
        }
    };

    const handleReload = () => {
        setDaysToShow(prevDays => prevDays + 4);
        setReload(!reload);
    };

    const handleRegisterClick = () => {
        setShowModal(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        console.log('Email submitted:', email);
        setShowModal(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <div className="container">

            <div className="header">
                <h1>Weather Dashboard</h1>
            </div>
            <div className="search-box">
                <input type="text" placeholder="E.g., New York, London, Tokyo" />
                <button onClick={() => handleSearch()}>Search</button>
                <span className="or">or</span>
                <button onClick={() => handleSearch(true)} className="current-location-btn" style={{ borderRadius: '5px' }}>Use Current Location</button>
            </div>
            {loading ? (
                <div className="spinner"></div>
            ) : (
                weatherData ? (
                    <>
                        <div className="current-weather">
                            <div className="weather-details">
                                <h2>{city} ({new Date().toLocaleDateString()})</h2>
                                <p>Temperature: {weatherData.temp_c}°C</p>
                                <p>Wind: {weatherData.wind_kph} KPH</p>
                                <p>Humidity: {weatherData.humidity}%</p>
                                <div className='saveBtn'>
                                    <button>Save</button>
                                </div>
                            </div>
                            <div className="weather-icon">
                                <img src={weatherData.condition.icon} alt={weatherData.condition.text} />
                                <p>{weatherData.condition.text}</p>
                            </div>
                        </div>
                        <div className="forecast">
                            {forecastData.map((day, index) => (
                                <div className="forecast-day" key={index}>
                                    <h3>{new Date(day.date).toLocaleDateString()}</h3>
                                    <p><img src={day.day.condition.icon} alt={day.day.condition.text} /></p>
                                    <p>Temp: {day.day.avgtemp_c}°C</p>
                                    <p>Wind: {day.day.maxwind_kph} KPH</p>
                                    <p>Humidity: {day.day.avghumidity}%</p>
                                </div>
                            ))}
                        </div>
                        <div className='LoadBtn'>
                            <button onClick={handleReload}>Load more</button>
                        </div>
                    </>
                ) : (
                    <div>Not found</div>
                )
            )}
            <div className='LoadBtn'>
                <button onClick={handleRegisterClick}>
                    Register
                </button>
            </div>
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleCloseModal}>&times;</span>
                        <form onSubmit={handleFormSubmit}>
                            <label >
                                <div className='emailLabel'>
                                    Email
                                </div>
                                <div className='inputEmail'>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </label>
                            <button type="submit">Submit</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherDashboard;
