import React, { Component } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TabNavigation from './TabNavigation';

var userDetails = {
    firstname: '',
    lastname: '',
    email: ''
}

var teams;
var invites;

class HomeNav extends Component {

    constructor(props){
        super(props);

        this.state = {
            location: props.location,
            compare: false
        }

        this.onComparePress = this.onComparePress.bind(this);
    }

    onComparePress() {

        this.setState({
            compare: !this.state.compare
        });
    }

    async componentDidMount() {

        let token = await AsyncStorage.getItem("@token")
        let id = await AsyncStorage.getItem("@id")
        let success = false

        await fetch('https://measuringplacesd.herokuapp.com/api/users/' + id, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                    'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        })
        .then((response) => (response.json()))
        .then(async (res) => (
                console.log(res),

                await AsyncStorage.setItem("@firstName", res.firstname),
                await AsyncStorage.setItem("@lastName", res.lastname),
                await AsyncStorage.setItem("@email", res.email),
                await AsyncStorage.setItem("@teams", JSON.stringify(res.teams)),
                await AsyncStorage.setItem("@invites", JSON.stringify(res.invites)),

                userDetails = {
                    firstName: res.firstname,
                    lastName: res.lastname,
                    email: res.email
                },
                teams = res.teams,
                invites = res.invites
            ))
        .catch((error) => (console.log(error), success = false))
    }

    render() {

        return(
            <TabNavigation
                location={this.state.location}
                toggleTheme={this.props.toggleTheme}
                navigation={this.props.navigation}
                userDetails={userDetails}
                teams={teams}
                invites={invites}
            />
        );

    }
}

export default HomeNav;
