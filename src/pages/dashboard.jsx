import React, { useState, useEffect } from 'react';
import '../style/global.css';
import { ColorPicker } from 'antd';
import { registerEmail, checkOTP, saveWeatherReport, loadWeatherByDate, loadWeatherReport, unSubscribe } from '../utils/APIs';
import { axiosClient } from '../utils/AxiosClient';

const WeatherDashboard = () => {
    const [city, setCity] = useState('Hồ Chí Minh');
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState([]);

    const [loading, setLoading] = useState(true);
    const [daysToShow, setDaysToShow] = useState(4);
    const [reload, setReload] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showOTPModal, setShowOTPMoDal] = useState(false);
    const [otp, setOTP] = useState('');
    const [email, setEmail] = useState('');
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [countdown, setCountdown] = useState(120);
    const [started, setStarted] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [reportDates, setReportDates] = useState([]);
    const [selectedReportDate, setSelectedReportDate] = useState(null);
    const [date, setDate] = useState(new Date().toLocaleDateString());
    const [showReportDates, setShowReportDates] = useState(false);
    const [showModalUnRegister, setShowModalUnRegister] = useState(false);

    useEffect(() => {
        fetchWeatherData(daysToShow);
    }, [city, reload]);


    const handleToggleReportDates = () => {
        setShowReportDates(!showReportDates);
    };

    const handleShowSuccess = () => {

        setShowSuccess(true);


        setTimeout(() => {
            setShowSuccess(false);
        }, 3000);
    };


    useEffect(() => {
        let intervalId;

        if (started && countdown > 0) {
            intervalId = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
            }, 1000);
        }

        return () => clearInterval(intervalId);
    }, [started, countdown]);

    const startCountdown = () => {
        setStarted(true);
    };



    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins == 0 && secs == 0)
            return `Expired`
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const fetchWeatherData = async (days) => {
        setLoading(true);
        try {
            const apiKey = 'ca1510b9fee441738ad114601241107';
            const weatherResponse = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`);
            const weather = await weatherResponse.json();
            setWeatherData(weather.current);

            const forecastResponse = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=${days}`);
            const forecast = await forecastResponse.json();

            setForecastData(forecast.forecast.forecastday);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (current = false) => {
        setDaysToShow(4)
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

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        startCountdown();
        let isBug = false;
        setShowModal(false);
        setShowOTPMoDal(true);
        try {
            const data = await registerEmail(email);

            if (data === 200) {
                console.log('Email sent successfully:', data);
            } else if (data === 409) {
                setErrorMessage("You're already registered");
                setShowError(true)
                isBug = true;
            }
        } catch (error) {
            isBug = true;
            console.error('Error:', error);
        }




        console.log('Email submitted:', email);
    };

    const handleOTPSubmit = async (e) => {
        e.preventDefault();
        let isBug = false;

        try {
            const data = await checkOTP(otp, email);

            if (data.status === 200) {
                console.log('OTP verified');
                setShowOTPMoDal(false);
            } else {
                isBug = true;
                setShowError(true);
                setErrorMessage('Invalid OTP code');
            }
        } catch (error) {
            console.error('Error: ', error);
        }

        if (!isBug) {
            setSuccessMessage("Register successful!!")
            handleShowSuccess();
            setShowOTPMoDal(false);
        } else {
            setShowError(true);
        }
    };


    const handleCloseModal = () => {

        setShowModal(false);
        setShowOTPMoDal(false);
        setShowModalUnRegister(false);
    };

    const handleSaveWeather = () => {

        const dataToSave = {
            city: city,
            temperature: weatherData.temp_c,
            wind_speed: weatherData.wind_kph,
            humidity: weatherData.humidity,
            weather_condition: weatherData.condition.text,
            condition_icon: weatherData.condition.icon,
            condition_text: weatherData.condition.text
            // report_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
        };
        setSuccessMessage("Saved temporary weather information")
        handleShowSuccess();
        saveWeatherReport(dataToSave);
    };

    const handleLoadWeather = async () => {
        handleToggleReportDates();
        try {
            const weatherReports = await loadWeatherReport();
            setReportDates(weatherReports);
        } catch (error) {
            console.error('Error loading weather reports:', error);
        }
    };

    const handleSelectReportDate = async (selectedDate) => {
        try {
            const weatherData = await loadWeatherByDate(selectedDate);
            console.log(weatherData)
            setWeatherData(weatherData);
            setWeatherData(prevWeatherData => ({
                ...prevWeatherData,
                wind_kph: weatherData.wind_speed,
                temp_c: weatherData.temperature,
                condition: {
                    ...prevWeatherData.condition,
                    icon: weatherData.condition_icon,
                    text: weatherData.condition_text
                }
            }));
            setCity(weatherData.city)
            setDate(weatherData.report_date)
            setSelectedReportDate(selectedDate);
        } catch (error) {
            console.error(`Error loading weather data for ${selectedDate}:`, error);
        }
    };

    const handleUnSubscribeClick = async () => {
        setShowModalUnRegister(true);
    }

    const handleUnSubscribeSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await unSubscribe(email);
            if (response == 204) {
                setSuccessMessage("You are unsubscribed :<")
                handleShowSuccess();
                setShowModalUnRegister(false)
            }
        }
        catch (error) {
            console.error('Error:', error);
            setErrorMessage("An error occur");
            setShowError(true);
        }
    }
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
                weatherData || selectedReportDate ? (
                    <>
                        <div className="current-weather">
                            <div className="weather-details">
                                <h2>{city} ({date})</h2>
                                <p>Temperature: {weatherData.temp_c}°C</p>
                                <p>Wind: {weatherData.wind_kph} KPH</p>
                                <p>Humidity: {weatherData.humidity}%</p>
                                <div className="saveBtn">
                                    <button className="saveButton" onClick={handleSaveWeather}>Save</button>
                                </div>
                                <div className="saveBtn">
                                    <button className="loadButton" onClick={handleLoadWeather}>Load</button>
                                </div>
                                {reportDates && showReportDates && (
                                    <div className="report-dates">
                                        <h3>Select a report date:</h3>
                                        <ul>

                                            {reportDates.map(date => (

                                                <li key={date}>
                                                    <div className=''>
                                                        <button onClick={() => handleSelectReportDate(date)}>{date}</button>
                                                    </div>
                                                </li>
                                            ))}

                                        </ul>
                                    </div>
                                )}
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
            <div className='Register'>
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
                                <div>
                                    {showError && <div className='error'>{errorMessage}</div>}
                                </div>
                            </label>
                            <button type="submit">Submit</button>
                        </form>
                    </div>
                </div>
            )}
            {showOTPModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleCloseModal}>&times;</span>
                        <form onSubmit={handleOTPSubmit}>
                            <label >
                                <div className='otpLabel'>
                                    We have sent an OTP to your email please check
                                    <p>The OTP will expire in: {formatTime(countdown)}</p>
                                </div>
                                <div className='inputOTP'>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOTP(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    {showError && <div className='error'>{errorMessage}</div>}
                                </div>
                            </label>
                            <button type="submit">Submit</button>
                        </form>
                    </div>
                </div>
            )}
            <div className='Register'>
                <button onClick={handleUnSubscribeClick} style={{ backgroundColor: 'red' }}>
                    Unsubscribe
                </button>

            </div>
            {showModalUnRegister && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleCloseModal}>&times;</span>
                        <form onSubmit={handleUnSubscribeSubmit}>
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
                                <div>
                                    {showError && <div className='error'>{errorMessage}</div>}
                                </div>
                            </label>
                            <button type="submit">Submit</button>
                        </form>
                    </div>
                </div>
            )}
            {showSuccess && (
                <div className="success-message">
                    <span>{successMessage}</span>
                </div>
            )}
        </div>
    );
};

export default WeatherDashboard;
