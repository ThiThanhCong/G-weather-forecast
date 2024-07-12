import { axiosClient } from "./AxiosClient";

const registerEmail = async (email) => {
    try {
        const response = await axiosClient.post('/api/sendmail/OTP', { email });
        console.log("res: ", response);
        if (response.data) {
            return response.status;
        }
        else {
            return null;
        }
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
const checkOTP = async (otp, email) => {
    try {
        const response = await axiosClient.post('/api/verifyOTP', { otp: otp, email: email });
        console.log(response);
        if (response.status)
            return response;
        else return null;
    } catch (error) {
        console.error('Error verifying OTP', error);
        throw error;
    }
};

const saveWeatherReport = async (data) => {
    try {
        const requestData = {
            ...data
        };
        console.log(requestData)
        const response = await axiosClient.post('/api/save', requestData);
        console.log('Weather report saved:', response.data);

    } catch (error) {
        console.error('Error saving weather report:', error);
    }
};



const loadWeatherReport = async () => {
    try {
        const response = await axiosClient.get('/api/reports');
        const weatherReports = response.reportDates;
        console.log('Weather reports:', weatherReports);
        return weatherReports;
    } catch (error) {
        console.error('Error loading weather reports:', error);
        throw error;
    }
};

const loadWeatherByDate = async (date) => {
    try {
        const response = await axiosClient.get(`/api/getByDate/${date}`);
        const weatherData = response.weatherData;
        console.log(`Weather data for ${date}:`, weatherData);
        return weatherData;
    } catch (error) {
        console.error(`Error loading weather data for ${date}:`, error);
        throw error;
    }
};

const unSubscribe = async (email) => {
    try {
        const response = await axiosClient.delete('/api/unRegister', {
            data: { email }
        });
        if (response)
            return response.status
        else
            return null

    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

export { registerEmail, checkOTP, saveWeatherReport, loadWeatherByDate, loadWeatherReport, unSubscribe };
