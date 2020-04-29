const spotifyParser = require("spotify-uri");
// could be cool to add our own art for the spotify playlits cover

export default class SpotifyAPI {
  constructor(clientId, responseType, redirectUri, scope) {
    this.clientId = clientId;
    this.responseType = responseType;
    this.redirectUri = redirectUri;
    this.scope = scope;
    this.url = `https://accounts.spotify.com/authorize?client_id=${
      this.clientId
    }&redirect_uri=${this.redirectUri}&response_type=${
      this.responseType
    }&scope=${encodeURI(this.scope)}`;
    this.userInfo = {};
    this.accessToken = "";
    this.topArtists = [];
    this.recommendations = [];
    this.playlistId = "";
    this.playlistEmbed = "";
  }
  getToken() {
    const href = window.location.href;
    if (href.includes("access_token")) {
      const userToken = href.match(/access_token=([^&]*)/)[1];
      this.accessToken = userToken;
    }
  }
  async getUserInfo() {
    const userToken = this.accessToken;
    if (userToken) {
      try {
        const response = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: "Bearer " + userToken,
          },
        });
        if (response.ok) {
          const jsonResponse = await response.json();
          this.userInfo = { ...jsonResponse };
        } else {
          return response.status;
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
  async getRecommendations(
    seedArtists,
    targetEnergy,
    minValence,
    maxValence,
    targetValence
  ) {
    const userToken = this.accessToken;
    const endpoint = "https://api.spotify.com/v1/recommendations?";
    let seed = seedArtists.join();
    // const url = `${endpoint}seed_artists=${encodeURI(
    // seed
    // )}&target_energy=${targetEnergy}&target_valence=${targetValence}&min_valence=${minValence}&max_valence=${maxValence}`;
    const url = `${endpoint}seed_artists=${encodeURI(
      seed
    )}&target_energy=${targetEnergy}&target_valence=${targetValence}`;
    const response = await fetch(url, {
      headers: {
        Authorization: "Bearer " + userToken,
      },
    });
    if (response.ok) {
      const jsonResponse = await response.json();
      jsonResponse.tracks.forEach((element) => {
        this.recommendations.push(element.uri);
      });
    }
  }
  catch(e) {
    console.log(e);
  }

  async getTopArtists() {
    const userToken = this.accessToken;
    if (userToken) {
      try {
        const response = await fetch(
          "https://api.spotify.com/v1/me/top/artists",
          {
            headers: {
              Authorization: "Bearer " + userToken,
            },
          }
        );
        if (response.ok) {
          const jsonResponse = await response.json();
          jsonResponse.items.forEach((element) => {
            this.topArtists.push(spotifyParser.parse(element.uri).id);
          });
        } else {
          return response.status;
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
  async createPlaylist() {
    const userId = this.userInfo.id;
    const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          name: `${this.userInfo.display_name.split(" ")[0]}'s Colors`,
          public: true,
          description:
            "Playlist generated by Color Therapy: https://github.com/kabirvirji/colortherapy",
        }),
      });
      if (response.ok) {
        const jsonResponse = await response.json();
        this.playlistId = jsonResponse.id;
        this.playlistEmbed = `https://open.spotify.com/embed/playlist/${
          spotifyParser.parse(jsonResponse.uri).id
        }`;
      } else {
        return response.status;
      }
    } catch (e) {
      console.log(e);
    }
  }
  async populatePlaylist() {
    const url = `https://api.spotify.com/v1/playlists/${this.playlistId}/tracks`;
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          uris: this.recommendations,
        }),
      });
      if (response.ok) {
        const jsonResponse = await response.json();
      } else {
        return response.status;
      }
    } catch (e) {}
  }
  async updatePlaylistImage(base64) {
    const url = `https://api.spotify.com/v1/playlists/${this.playlistId}/images`;
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "image/jpeg",
          // Accept: "application/json",
        },
        method: "PUT",
        // I think the 400 error is because something is wrong with the format of the body
        // I don't think the key is "data" it might be "image" or something else not sure
        // Maybe we need to do something to the base64 string before we send it
        // https://developer.spotify.com/documentation/web-api/reference/playlists/upload-custom-playlist-cover/
        body: base64.replace(/^data:image\/jpeg;base64,/, ""),
      });
      if (response.ok) {
        const jsonResponse = await response.json();
      } else {
        return response.status;
      }
    } catch (e) {}
  }
  reset() {
    this.recommendations = [];
    this.playlistId = "";
    this.playlistEmbed = "";
  }
}
