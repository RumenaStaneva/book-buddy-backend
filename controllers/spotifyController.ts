import { Request, Response, Router } from 'express';
import axios from 'axios';
import btoa from 'btoa';
import { IGetUserAuthInfoRequest } from '../types/express';



const getSpotifyToken = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const clientId = process.env.SPOTIFY_CLIENTID;
    const clientSecret = process.env.SPOTIFY_SECRET;

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token',
            'grant_type=client_credentials', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret),
            },
        });

        const { access_token } = response.data;
        res.json({ accessToken: access_token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export {
    getSpotifyToken
}