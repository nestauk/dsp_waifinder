<script>
	import {isClientSide} from '@svizzle/ui/src/utils/env';
	import FingerprintJS from '@fingerprintjs/fingerprintjs';

	import {_deviceId} from 'app/stores/device';

	const getDeviceId = async () => {
		$_deviceId =
			await FingerprintJS.load({monitoring: false})
			.then(fp => fp.get())
			.then(result => result.visitorId);
	}

	$: isClientSide && getDeviceId();
</script>

{$_deviceId}
