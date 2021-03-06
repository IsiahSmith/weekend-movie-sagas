import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App/App.js';
import { createStore, combineReducers, applyMiddleware } from 'redux';
// Provider allows us to use redux within our react app
import { Provider } from 'react-redux';
import logger from 'redux-logger';
// Import saga middleware
import createSagaMiddleware from 'redux-saga';
import { takeEvery, put } from 'redux-saga/effects';
import axios from 'axios';

// Create the rootSaga generator function
function* rootSaga() {
    yield takeEvery('FETCH_MOVIES', fetchAllMovies);
    yield takeEvery('FETCH_GENRES', fetchGenres);
    yield takeEvery('ADD_MOVIE', addMovie);
    yield takeEvery('GENRE_LIST', genreList);
}

function* fetchAllMovies() {
    // get all movies from the DB
    try {
        const movies = yield axios.get('/api/movie');
        console.log('get all:', movies.data);
        yield put({ type: 'SET_MOVIES', payload: movies.data });

    } catch {
        console.log('get all error');
    }
}

function* addMovie(action) {
    try {
        console.log('POST payload is', action.payload);
        yield axios.post('/api/movie', action.payload);
        yield put({ type: 'FETCH_MOVIES' });
    } catch (err) {
        console.log('Error in AddMovie', err);
    }
}

function* fetchGenres(action) {
    try {
        console.log('this is action.payload', action.payload);
        let movie = action.payload;
        const response = yield axios.get(`/api/genre/details?id=${movie.id}`)
        yield put({ type: 'SET_GENRES', payload: response.data })
    } catch (err) {
        console.log('Error in fetchGenres', err);
    }
}

function* genreList() {
    try {
        const response = yield axios.get('/api/genre/list')
        console.log('Response is', response.data);
        yield put({ type: 'ALL_GENRES', payload: response.data })
    } catch (err) {
        console.log('Error in genreList', err);
    }
}


// Create sagaMiddleware
const sagaMiddleware = createSagaMiddleware();

// Used to store movies returned from the server
const movies = (state = [], action) => {
    switch (action.type) {
        case 'SET_MOVIES':
            return action.payload;
        default:
            return state;
    }
}

// Used to store the movie genres
const genres = (state = [], action) => {
    switch (action.type) {
        case 'SET_GENRES':
            return action.payload;
        default:
            return state;
    }
}

const allGenres = (state = [], action) => {
    switch (action.type) {
        case 'ALL_GENRES':
            console.log('action.payload is', action.payload);
            return action.payload;
        default:
            return state;
    }
}

const selectedId = (state = '', action) => {
    switch (action.type) {
        case 'SELECTED_ID':
            return action.payload;
        default:
            return state;
    }
}

// Create one store that all components can use
const storeInstance = createStore(
    combineReducers({
        movies,
        genres,
        allGenres,
        selectedId
    }),
    // Add sagaMiddleware to our store
    applyMiddleware(sagaMiddleware, logger),
);

// Pass rootSaga into our sagaMiddleware
sagaMiddleware.run(rootSaga);

ReactDOM.render(
    <React.StrictMode>
        <Provider store={storeInstance}>
            <App />
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);
