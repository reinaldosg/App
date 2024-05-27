import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {Keyboard} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {validateTaxClaimableValue} from '@libs/PolicyDistanceRatesUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/PolicyDistanceRateTaxReclaimableOnEditForm';
import type * as OnyxTypes from '@src/types/onyx';

type PolicyDistanceRateTaxReclaimableOnEditPageOnyxProps = {
    /** Policy details */
    policy: OnyxEntry<OnyxTypes.Policy>;
};

type PolicyDistanceRateTaxReclaimableOnEditPageProps = PolicyDistanceRateTaxReclaimableOnEditPageOnyxProps &
    StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DISTANCE_RATE_TAX_RECLAIMABLE_ON_EDIT>;

function PolicyDistanceRateTaxReclaimableOnEditPage({policy, route}: PolicyDistanceRateTaxReclaimableOnEditPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const policyID = route.params.policyID;
    const rateID = route.params.rateID;
    const customUnits = policy?.customUnits ?? {};
    const customUnit = customUnits[Object.keys(customUnits)[0]];
    const rate = customUnit.rates[rateID];
    const currency = rate.currency ?? CONST.CURRENCY.USD;
    const currentTaxReclaimableOnValue = rate.attributes?.taxClaimablePercentage && rate.rate ? (rate.attributes.taxClaimablePercentage * rate.rate) / 100 : '';
    const submitTaxReclaimableOn = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_TAX_RECLAIMABLE_ON_EDIT_FORM>) => {
        Policy.updatePolicyDistanceRateValue(policyID, customUnit, [
            {
                ...rate,
                attributes: {
                    ...rate.attributes,
                    taxClaimablePercentage: rate.rate ? (Number(values.taxClaimableValue) * 100) / rate.rate : undefined,
                },
            },
        ]);
        Keyboard.dismiss();
        Navigation.goBack();
    };

    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_TAX_RECLAIMABLE_ON_EDIT_FORM>) => validateTaxClaimableValue(values, rate), [rate]);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={PolicyDistanceRateTaxReclaimableOnEditPage.displayName}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.taxes.taxReclaimableOn')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_TAX_RECLAIMABLE_ON_EDIT_FORM}
                    submitButtonText={translate('common.save')}
                    onSubmit={submitTaxReclaimableOn}
                    validate={validate}
                    enabledWhenOffline
                    style={[styles.flexGrow1]}
                    shouldHideFixErrorsAlert
                    submitFlexEnabled={false}
                    submitButtonStyles={[styles.mh5, styles.mt0]}
                    disablePressOnEnter={false}
                >
                    <InputWrapperWithRef
                        InputComponent={AmountForm}
                        inputID={INPUT_IDS.TAX_CLAIMABLE_VALUE}
                        extraDecimals={1}
                        defaultValue={currentTaxReclaimableOnValue?.toString() ?? ''}
                        isCurrencyPressable={false}
                        currency={currency}
                        ref={inputCallbackRef}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

PolicyDistanceRateTaxReclaimableOnEditPage.displayName = 'PolicyDistanceRateTaxReclaimableOnEditPage';

export default withOnyx<PolicyDistanceRateTaxReclaimableOnEditPageProps, PolicyDistanceRateTaxReclaimableOnEditPageOnyxProps>({
    policy: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.POLICY}${route.params.policyID}`,
    },
})(PolicyDistanceRateTaxReclaimableOnEditPage);
