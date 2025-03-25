import React, {useState} from 'react';
import axios from 'axios';

// You'll need to setup a client app in console.developers.google.com and setup the Auth credentials to get these values
const googleClientId = '248796535-j7oonfrn0rdqk3it4stf805dj89h67l8.apps.googleusercontent.com';
const googleClientSecret = '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';

// The clientId is the organsiation account ID that your user will be associated with in ObjectsGrid. If you
// don't have one (i.e. this is the first user for this org) then you'll need to create one with the Google token
const objectsGridClientId = 'org-170-4698';

// Replace with your actual redirect URI. This is what Google will redirect users to after it has finished the
// authentication process. If Google is using a popup instead of a full-page "wizard" then this will not be used.
const redirectUri = 'http://localhost:3000';

// The URL to exchange the Google token for an ObjectsGrid token
const objectsGridUserAccountUrl = 'https://testapis.objectsgrid.com/oauth2/token/useraccount';

// The region that your ObjectsGrid org is located in. Valid values are "EU" or "US".
const objectsGridAccessPoint = 'US';

const GoogleAuth = ({onOgTokenReceived}) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [profile, setProfile] = useState(null);
    const [objectsGridToken, setObjectsGridToken] = useState(null);

    // Build the URL that will be used for the popup Google login window.
    const getGoogleAuthUrl = () => {
        const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        const options = {
            redirect_uri: redirectUri,
            client_id: googleClientId,
            access_type: 'offline',
            response_type: 'code',
            prompt: 'consent',
            scope: 'openid profile email',
        };

        const params = new URLSearchParams(options);
        return `${rootUrl}?${params.toString()}`;
    };

    // When we click on the login button, redirect the popup window to the Google login URL.
    const login = async () => {
        window.location.href = getGoogleAuthUrl();
    };

    // This code will get the user info from the Google API using the access token that we got from the OAuth2 flow. It's not
    // necessary for the ObjectsGrid token exchange, but it demonstrates how to use the Google token to get user info.
    const getProfile = async ({access_token}) => {
        const response = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        return response.data;
    };

    // ONce the user has authenticated with Google, we can get the user profile information and then exchange the Google token for an ObjectsGrid
    // token that can be used for all subsequent ObjectsGrid API calls.
    const handleLoginSuccess = async (code) => {
        try {
            // Exchange authorization code for tokens
            const {data} = await axios.post('https://oauth2.googleapis.com/token', {
                code,
                client_id: googleClientId,
                client_secret: googleClientSecret, // Replace with your actual client secret
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            });

            // The access token that is returned from Google authentication will be used to get the user's profile information.
            const accessToken = data.access_token;
            console.log('Got access token: ', data);

            // The id token from Google will be used for the ObjectsGrid API calls.
            const idToken = data.id_token;
            if (!idToken) {
                console.error('Failed to retrieve id_token');
                return;
            }

            // Get the user profile data (name, email etc.) using the access token
            const profileData = await getProfile({access_token: accessToken});
            setIsLoggedIn(true);
            setProfile({...profileData, idToken});
            console.log('Got profile data:', profileData);

            // Exchange the Google token for an ObjectsGrid token
            await exchangeToken(idToken);
        } catch (error) {
            console.error('Login Failed:', error.message || error);
        }
    };

    const logout = () => {
        setIsLoggedIn(false);
        setProfile(null);
        setObjectsGridToken(null);
        console.log('Logout Success');
    };

    // This is the code that will exchange the id_token that was retruned from Google for an ObjectsGrid token that can be used in future
    // ObjectsGrid API calls.
    const exchangeToken = async (googleToken) => {

        try {
            const response = await axios.post(objectsGridUserAccountUrl, {
                grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
                subject_token: googleToken,
                subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
                client_id: objectsGridClientId,
                'X-ObjectsGrid-AccessPoint': objectsGridAccessPoint,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-ObjectsGrid-AccessPoint': 'US',
                    'X-ObjectsGrid-RestApiVersion': 'stable',
                    'X-ObjectsGrid-SessionID': 'session123',
                }
            });

            // Set the ObjectsGrid token in the state so that it can be used in future API calls.
            console.log('ObjectsGrid Token:', response.data.access_token);
            setObjectsGridToken(response.data.access_token);

            onOgTokenReceived(response.data.access_token);

        } catch (error) {
            console.error('Token exchange failed:', error.message || error);
        }
    };

    // Parse URL query parameters to get the auth code
    const queryParams = new URLSearchParams(window.location.search);
    const authCode = queryParams.get('code');

    if (authCode && !isLoggedIn) {
        handleLoginSuccess(authCode);
    }

    return (
        <div>
            <div style={{display: "flex", alignItems: "center", width: "100%"}}>
                <h2 style={{paddingRight: '10px'}}>Auth Data</h2>
                {!isLoggedIn ? (
                    <button className="button" onClick={login}>Login with Google</button>
                ) : (
                    <button className="button" onClick={logout}>Logout</button>
                )}
            </div>
            {isLoggedIn ? (
            <div>
                <div className="data" style={{display: "flex", width: "100%"}}>
                    <div>
                        <div><b>Profile Data from Google</b></div>
                        <div>Profile: {profile ? profile.name : 'Error'}</div>
                        <div>Email: {profile ? profile.email : 'Error'}</div>
                    </div>
                    <div className="div-token-id"><b>Google Token:</b> {profile ? profile.idToken : 'Error'}</div>
                    <div className="div-token-id"><b>ObjectsGrid Token:</b> {objectsGridToken ? objectsGridToken : 'Error'}</div>
                </div>
            </div>
            ) : ""}
        </div>
    );
};

export default GoogleAuth;