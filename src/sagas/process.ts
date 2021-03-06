/* eslint-disable import/prefer-default-export */
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { Alert } from 'react-native';
import { SagaIterator } from 'redux-saga';
import {
  call, put, select, takeLatest,
} from 'redux-saga/effects';
import * as actions from '../actions/process';
import { postDetectFace } from '../api/face';
import { FreeGeoIpResult } from '../api/freegeoip';
import { FaceResult } from '../api/types';
import { postDescribePhoto } from '../api/vision';
import { CONFIG, ApiLocationKey, AzureLocation } from '../config';
import { GEO_COUNTRIES } from '../constants';
import { AppMode, AppState } from '../store';


function* pickImageFromCameraSaga(): SagaIterator {
  yield put(actions.pickImageStart(undefined));
  const perm1: Permissions.PermissionResponse = yield call(
    Permissions.askAsync, Permissions.CAMERA,
  );
  const perm2: Permissions.PermissionResponse = yield call(
    Permissions.askAsync, Permissions.CAMERA_ROLL,
  );
  if (perm1.status === 'granted' && perm2.status === 'granted') {
    const result: ImagePicker.ImagePickerResult = yield call(
      ImagePicker.launchCameraAsync,
      {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [1, 1],
      },
    );
    if (!result.cancelled) {
      if (result.type === 'image') {
        yield put(actions.pickImageSuccess(result));
      } else {
        Alert.alert(
          'Invalid Media Type!',
          `Media type '${result.type}' is not surpported. Please select a photo and try again.`,
        );
      }
    }
  } else {
    Alert.alert(
      'Permission Required!',
      'Permission CAMERA and CAMERA_ROLL are required.',
    );
  }
}

function* pickImageFromLibrarySaga(): SagaIterator {
  yield put(actions.pickImageStart(undefined));
  const perm: Permissions.PermissionResponse = yield call(
    Permissions.askAsync, Permissions.CAMERA_ROLL,
  );
  if (perm.status === 'granted') {
    const result: ImagePicker.ImagePickerResult = yield call(
      ImagePicker.launchImageLibraryAsync,
      {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [1, 1],
      },
    );
    if (!result.cancelled) {
      if (result.type === 'image') {
        yield put(actions.pickImageSuccess(result));
      } else {
        Alert.alert(
          'Invalid Media Type!',
          `Media type '${result.type}' is not surpported. Please select a photo and try again.`,
        );
      }
    }
  } else {
    Alert.alert(
      'Permission Required!',
      'Permission CAMERA_ROLL is required.',
    );
  }
}

function* getApiKeyByGeoLocation(appMode: AppMode): SagaIterator {
  const geoIp: FreeGeoIpResult = yield select((s: AppState) => s.network.freeGeoIp);

  let azureLocation: AzureLocation | undefined;
  const country = GEO_COUNTRIES.find((i) => i.country_iso_code === geoIp.country_code);
  if (country !== undefined) {
    azureLocation = CONFIG.geoAzureLocationMap[country.continent_code];
  }

  switch (appMode) {
    case 'Face':
      return CONFIG.faceApiKeys.find((i) => i.location === azureLocation)
        || CONFIG.faceApiKeys[0];
    case 'Vision':
      return CONFIG.visionApiKeys.find((i) => i.location === azureLocation)
        || CONFIG.visionApiKeys[0];
    default:
      throw new Error(`Unknown app mode ${appMode}`);
  }
}

function* detectFaceSaga(action: typeof actions.detectFace.shape): SagaIterator {
  yield put(actions.processStart(undefined));
  const key: ApiLocationKey = yield call(getApiKeyByGeoLocation, 'Face');
  try {
    const result: Array<FaceResult> = yield call(
      postDetectFace,
      action.payload,
      key,
    );
    yield put(actions.processSuccess({ face: result }));
  } catch (e) {
    yield put(actions.processError(e));
  }
}

function* describePhotoSaga(action: typeof actions.describePhoto.shape): SagaIterator {
  yield put(actions.processStart(undefined));
  const key: ApiLocationKey = yield call(getApiKeyByGeoLocation, 'Vision');
  try {
    const result = yield call(
      postDescribePhoto,
      action.payload,
      key,
    );
    yield put(actions.processSuccess({ vision: result }));
  } catch (e) {
    yield put(actions.processError(e));
  }
}

export function* processSaga(): SagaIterator {
  yield takeLatest(actions.pickImageFromCamera.type, pickImageFromCameraSaga);
  yield takeLatest(actions.pickImageFromLibrary.type, pickImageFromLibrarySaga);
  yield takeLatest(actions.detectFace.type, detectFaceSaga);
  yield takeLatest(actions.describePhoto.type, describePhotoSaga);
}
