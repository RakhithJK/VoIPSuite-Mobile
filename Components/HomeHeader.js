import Icon from 'react-native-vector-icons/Feather';
import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import styles from '../style';
import {openDrawer} from '../helpers/RootNavigation';
import {CustomModal} from '.';
import {useDispatch, useSelector} from 'react-redux';
import {profileActions} from '../redux/actions/profile';
import _ from 'lodash';
import RBSheet from 'react-native-raw-bottom-sheet';
import {Button} from 'react-native-elements';
import Metrics from '../helpers/Metrics';
import {getColorByTheme} from '../helpers/utils';

const HomeHeader = ({onPressProfile = () => {}}) => {
  const [isProfileModalVisible, setProfileModalVisibility] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [activeProfileNumber, setActiveProfileNumber] = useState(null);
  const [profileName, setProfileName] = useState('Choose Profile Name');

  const dispatch = useDispatch();

  const isLoading = useSelector(state => state.profile.isLoading);
  const profile = useSelector(state => state.profile.items);

  const refRBSheet = useRef();

  useEffect(() => {
    getProfileList();
  }, []);

  useEffect(() => {
    if (profile && _.isArray(profile)) {
      let data = [];
      profile.forEach((item, index) => {
        const {id, profile, number, messageCount} = item;
        data.push({id, profile, number, messageCount});
      });

      setProfiles(data);
      onSetProfileNameRedux({profile: data[0]?.profile, id: data[0]?.id});
      onPressProfile(data[0]?.id);
      setActiveProfileNumber(data[0]?.number);
    }
  }, [profile]);

  const showProfileDropDown = () => {
    refRBSheet.current.open();
  };

  const onSetProfileNameRedux = param => {
    setProfileName(param.profile);
    dispatch(profileActions.setProfileName(param));
  };

  const onSelectProfile = item => {
    const {id, number, profile} = item;

    onPressProfile(id);
    setProfileName(profile);
    setActiveProfileNumber(number);
    onSetProfileNameRedux({profile, id});

    refRBSheet.current.close();
  };

  const getProfileList = () => {
    dispatch(profileActions.getProfileAction());
  };

  const onPressSideMenu = () => {
    openDrawer();
  };

  const onModalOpen = () => {
    refRBSheet.current.close();
    setTimeout(() => {
      setProfileModalVisibility(true);
    }, 500);
  };

  const onModalClose = () => {
    setProfileModalVisibility(false);
  };

  const onPressSaveProfileName = (data, errorCb) => {
    dispatch(
      profileActions.createProfileAction(data, onSaveProfileCb, errorCb),
    );
  };

  const onSaveProfileCb = () => {
    setProfileModalVisibility(false);
    getProfileList();
  };

  const getProfileListItemHeight = () => {
    let height = Dimensions.get('window').height / 2 + 100;
    let length = profiles.length;

    if (length > 4) {
      return height;
    }

    return length * Metrics.doubleBaseMargin + 200;
  };

  const renderProfileItem = ({item}) => {
    const {profile, number, messageCount} = item;

    return (
      <View style={innerStyle.profileItemContainer}>
        <TouchableOpacity
          style={innerStyle.profileItemView}
          onPress={() => onSelectProfile(item)}>
          <Text style={innerStyle.profileItemText}>{profile}</Text>
          {number && (
            <Text style={[innerStyle.profileItemText, {color: '#ff5821'}]}>
              {number}
            </Text>
          )}
        </TouchableOpacity>
        {messageCount > 0 && (
          <Text style={innerStyle.profileItemBadgeCount}>{messageCount}</Text>
        )}
      </View>
    );
  };

  const renderTitleNumber = () => {
    return <Text style={styles.homeHeaderAppTitle}>{activeProfileNumber}</Text>;
  };

  const renderBottomSheet = () => {
    const height = getProfileListItemHeight();

    return (
      <RBSheet
        ref={refRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        dragFromTopOnly={true}
        height={height}
        customStyles={{
          container: innerStyle.sheetContainer,
        }}>
        <View style={innerStyle.profileListContainer}>
          {renderProfileList()}
        </View>
        <Button title={'Add new profile'} onPress={onModalOpen}></Button>
      </RBSheet>
    );
  };

  const renderProfileList = () => {
    return (
      <FlatList
        data={profiles}
        renderItem={renderProfileItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={true}
      />
    );
  };

  return (
    <View style={[styles.fullFlex, styles.homeHeaderWrapper]}>
      <View style={styles.homeHeaderLeftContainer}>
        <TouchableOpacity onPress={onPressSideMenu}>
          <Icon name={'menu'} size={25} style={styles.defaultIconColor} />
        </TouchableOpacity>
        {activeProfileNumber && renderTitleNumber()}
      </View>
      <View style={styles.fullFlex}>
        <View style={{marginLeft: 10}}>
          <TouchableOpacity
            onPress={showProfileDropDown}
            style={styles.fullFlex}>
            <Text style={innerStyle.profileText}>{profileName}</Text>
            <Icon
              name={'arrow-down'}
              size={19}
              style={styles.defaultIconColor}
            />
          </TouchableOpacity>
        </View>
      </View>
      {renderBottomSheet()}
      <CustomModal
        isVisible={isProfileModalVisible}
        onBackdropPress={onModalClose}
        onPressSave={onPressSaveProfileName}
        isLoading={isLoading}
      />
    </View>
  );
};

const innerStyle = StyleSheet.create({
  sheetContainer: {
    // borderWidth: 0.5,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    // marginBottom: Metrics.baseMargin
  },
  profileText: {
    fontSize: 14,
    fontFamily: Metrics.fontRegular,
    color: getColorByTheme('#000', '#fff'),
  },
  profileListContainer: {
    flex: 1,
    paddingHorizontal: Metrics.baseMargin,
    marginTop: Metrics.baseMargin,
  },
  profileItemContainer: {
    flexDirection: 'row',
    paddingVertical: Metrics.baseMargin,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
  },
  profileItemView: {
    flex: 1,
  },
  profileItemText: {
    fontSize: 16,
    color: getColorByTheme('#000', '#000'),
    fontFamily: Metrics.fontRegular,
  },
  profileItemBadgeCount: {
    alignSelf: 'center',
    borderRadius: 5,
    width: 20,
    height: 20,
    backgroundColor: '#dc3545',
    color: '#fff',
    marginLeft: Metrics.smallMargin,
    textAlign: 'center',
  },
});

export default HomeHeader;
