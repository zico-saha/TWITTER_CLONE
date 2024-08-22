import UAParser from 'ua-parser-js';

export const getUserInfo = () => {
    const parser = new UAParser();
    const uaResult = parser.getResult();

    return {
        browser: uaResult.browser.name,
        os: uaResult.os.name,
        device: uaResult.device.type || 'Desktop',
    };
};