import Cookies from 'js-cookie';

const initialState = {
    sessions: {
        email: null,
        token: null
    },
    popupPage: null,
    popupErrMsg: null,
    toast: null, // reserve for general information or success message
    selectedCollectionId: null,
    collections: {
        // "c1": {
        //     "_id": "c1",
        //     "name": "The favorite weekend",
        //     "ownerEmail": "skborey@gmail.com"
        // },
        // "c2": {
        //     "_id": "c2",
        //     "name": "New collection 1",
        //     "ownerEmail": "skborey1@gmail.com"
        // },
        // "c3": {
        //     "_id": "c3",
        //     "name": "New collection 2",
        //     "ownerEmail": "skborey@gmail.com"
        // }
    },
    restaurants: {
        // "r1": {
        //     "_id": "r1",
        //     "name": "Restuarant 1",
        //     "open": "7 AM - 9 AM"
        // },
        // "r2": {
        //     "_id": "r2",
        //     "name": "Restuarant 2",
        //     "open": "8 AM - 10 AM"
        // },
        // "r3": {
        //     "_id": "r3",
        //     "name": "Restuarant 3",
        //     "open": "9 AM - 11 AM"
        // }
    },
    collaborators: {
        // "cb1": {
        //     "_id": "cb1",
        //     "name": "Borey 1",
        //     "collection_id": "c1",
        //     "email": "skborey1@gmail.com"
        // },
        // "cb2": {
        //     "_id": "cb2",
        //     "name": "Borey 2",
        //     "collection_id": "c2",
        //     "email": "skborey2@gmail.com"
        // },
        // "cb3": {
        //     "_id": "cb3",
        //     "name": "Borey 3",
        //     "collection_id": "c3",
        //     "email": "skborey3@gmail.com"
        // }
    },
    relationC2R: [
        // ["c1", "r1"],
        // ["c1", "r3"],
        // ["c2", "r2"],
        // ["c2", "r3"],
        // ["c3", "r1"],
    ],
    relationC2C: [ // Relation between collection to collaborator is 1 -> Many, collaborator NOT refer to USER
        // ["c1", "cb1"],
        // ["c2", "cb3"],
        // ["c3", "cb2"],
    ],
}

const cases = {

    INITIALIZE_SESSION: (state, action) => {

        console.log('@TODO handle respone from backend', action);

        if (action.error) { console.error(action.error)

            return {
                ...state,
                sessions: {},
                popupErrMsg: "OOP! Something went wrong.",
            }
        } else if (action.success) {

            const _sessions = (action.sessions.email 
                                && action.sessions.token) ?
                                    action.sessions : {};

            return {
                ...state,
                sessions: _sessions,

                collections: action.state.collections,
                restaurants: action.state.restaurants,
                collaborators: action.state.collaborators,
                relationC2R: action.state.relationC2R,
                relationC2C: action.state.relationC2C,
            }
        } else {
            return {
                ...state,
                sessions: {},
                popupErrMsg: null,
            }
        }
    },

    SHOW_POPUP: (state, action) => {

        return {
            ...state,
            popupPage: action.name,
        }
    },

    RESET_POPUP: (state, action) => { 
        
        return {
            ...state,
            popupPage: null,
            popupErrMsg: null,
        }
    },

    REGISTER: (state, action) => {

        const _popupErrMsg = (action.error) ?
                                "OOP! Something went wrong." : action.message ?
                                        action.message :
                                            "Account is created successfully.";
        return {
            ...state,
            popupErrMsg: _popupErrMsg,
        }
    },

    LOGIN: (state, action) => {
        
        if (action.error) {

            return {
                ...state,
                sessions: {},
                popupErrMsg: "OOP! Something went wrong.",
            }
        } else if (action.success) {

            Cookies.set('token', action.token, { expires: 1 });
            
            return {
                ...state,
                sessions: { email: action.email, token: action.token },
                
                collections: action.state.collections,
                restaurants: action.state.restaurants,
                collaborators: action.state.collaborators,
                relationC2R: action.state.relationC2R,
                relationC2C: action.state.relationC2C,

                popupErrMsg: null,
                popupPage: null,
            }
        } else {

            return {
                ...state,
                sessions: {},
                popupErrMsg: action.message,
            }
        }
    },

    LOGOUT: (state, action) => {

        if (action.response.success) {
                
                Cookies.remove('token');

                initialState['restaurants'] = state.restaurants;

                // return { ...state, sessions: {} }
                return initialState;
        } else if (action.error) {
            console.log('@TODO Not handle yet with is error.');
        } else {
            console.log('@TODO Not handle yet.');
        }

        return state;
    },

    /**
     * Collection
     */
    ADD_NEW_COLLECTION: (state, action) => {

        // console.log('@TODO Handle respones from backend', action);

        if (action.error) {
            if (action.error.response.status === 401) { // maybe session expired
                Cookies.remove('token');
                return { ...state, sessions: {} }
            }
        }

        if (action.success) {
            const _collection = {
                _id: action.collection._id,
                name: action.collection.name,
                ownerEmail: action.collection.owner_email,
            }
            return {
                ...state,
                collections: {
                    ...state.collections,
                    [_collection._id]: _collection
                },
                // reset popup
                popupPage: null,
                popupErrMsg: null,
            }
        }

        return state;
    },
    
    SHOW_COLLECTION: (state, action) => {
        return {
            ...state,
            selectedCollectionId: action.id
        }
    },

    DELETE_COLLECTION: (state, action) => {

        console.log('@TODO Handle respones from backend');
        if (action.error) {
            if (action.error.response.status === 401) { // maybe session expired
                Cookies.remove('token');
                return { ...state, sessions: {} }
            } else {
                return { ...state, popupErrMsg: action.error.message }
            }
        }

        if (!action.success) {
            return {
                ...state,
                toast: action.message
            }
        }

        const id = action.id;
        const isCollectionOwner = (state.sessions.email === state.collections[id].ownerEmail);

        // Remove collection from store and relation base on ownership 
        // (if not collection owner we just remove them from that collection only but not delete that collection)
        // @Second change: this done by backend frontend just remove for view
        const collections = state.collections;
        const _collections = (Object.keys(collections)
                            .filter(key => key !== id) // exclude the removed collection
                                .reduce((result, current) => {
                                    result[current] = collections[current];
                                    return result;
                                }, {})
                        );

        const _relationC2R = isCollectionOwner ? 
                        state.relationC2R.filter((pair) => pair[0] !== id)
                            : state.relationC2R;

        const _relationC2C = state.relationC2C.filter((pair) => pair[0] !== id);

        // reset the selected collection id
        const _selectedCollectionId = state.selectedCollectionId === id ?
                                            null: state.selectedCollectionId;

        return {
            ...state,
            collections: _collections,
            relationC2R: _relationC2R,
            relationC2C: _relationC2C,
            selectedCollectionId: _selectedCollectionId,
            toast: action.message,
        }
    },

    /**
     * Collaborator
     */
    ADD_NEW_COLLABORATOR: (state, action) => {

        console.log('@TODO Handle respones from backend', action);

        if (action.error) {
            if (action.error.response.status === 401) { // maybe session expired
                Cookies.remove('token');
                return { ...state, sessions: {} }
            } else {
                return { ...state, popupErrMsg: action.error.message }
            }
        }

        if (action.success) {
            let _collaborator = action.collaborator;
            let _relationC2C = action.relationC2C;

            return {
                ...state,
                collaborators: {
                    ...state.collaborators,
                    [_collaborator._id]: _collaborator
                },
                relationC2C: [
                    ...state.relationC2C,
                    _relationC2C
                ],
                // reset popup
                popupPage: null,
                popupErrMsg: null,
            }
        } else {
            return { ...state, popupErrMsg: action.message }
        }
    },

    RENAME_COLLABORATOR: (state, action) => {

        console.log('@TODO Handle respones from backend');

        return {
            ...state,
            collaborators: {
                ...state.collaborators,
                [action.id]: action.name,
            }
        }
    },

    DELETE_COLLABORATOR: (state, action) => {
        
        console.log('@TODO Handle respones from backend');

        if (action.error) {
            if (action.error.response.status === 401) { // maybe session expired
                Cookies.remove('token');
                return { ...state, sessions: {} }
            } else {
                return { ...state, popupErrMsg: action.error.message }
            }
        }

        if (!action.success) {
            return {
                ...state,
                toast: action.message
            }
        }

        const id = action.id

        // delete from collaborator store
        const collaborators = state.collaborators;
        const _collaborators = Object.keys(collaborators)
                            .filter(key => key !== id) // exclude the removed collaborator
                                .reduce((result, current) => {
                                    result[current] = collaborators[current];
                                    return result;
                                }, {});

        // delete from relation
        const _relationC2C = state.relationC2C.filter((pair) => // We remove collaborator from current collection only. But actually it doesn't have more than one already.
                                !(pair[0] === state.selectedCollectionId && pair[1] === id));

        return {
            ...state,
            relationC2C: _relationC2C,
            collaborators: _collaborators,
            toast: action.message
        }
    },

    /**
     * Restaurant
     */
    ADD_RESTAURANT_TO_COLLECTION: (state, action) => {

        console.log('@TODO Handle respones from backend', action);

        if (action.error) {
            if (action.error.response.status === 401) { // maybe session expired
                Cookies.remove('token');
                return { ...state, sessions: {} }
            } else {
                return { ...state, popupErrMsg: action.error.message }
            }
        } else if (action.success) {
            return {
                ...state,
                relationC2R: [
                    ...state.relationC2R,
                    [action.collectionId, action.restaurantId]
                ],
                toast: action.message
            }
        }

        //not handle fail case

        return state;
    },

    REMOVE_RESTAURANT_FROM_COLLECTION: (state, action) => {

        console.log('@TODO Handle respones from backend', action);

        if (action.error) {
            if (action.error.response.status === 401) { // maybe session expired
                Cookies.remove('token');
                return { ...state, sessions: {} }
            } else {
                return { ...state, popupErrMsg: action.error.message }
            }
        } else if (action.success) {

            const _relationC2R = state.relationC2R.filter(
                (pair) => !(pair[0] === action.collectionId &&
                                pair[1] === action.restaurantId));

            return {
                ...state,
                relationC2R: _relationC2R,
                toast: action.message
            }
        } else {
            return {
                ...state,
                toast: action.message
            }
        }
    },

    GET_RESTAURANTS: (state, action) => {
        
        return {
            ...state,
            restaurants: action.restaurants,
        }
    }

}

const reducer = (state = initialState, action) => {
    const handler = cases[action.type]
    return handler ? handler(state, action) : state
}

export default reducer;