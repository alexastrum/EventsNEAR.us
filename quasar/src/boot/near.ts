import { boot } from 'quasar/wrappers';
import { NEAR_SWRV_KEY } from 'src/hooks/near';
import { mutate } from 'src/hooks/swrv';
import { getNear } from 'src/services/near';

export interface NearUser {
  accountId: string;
  balance: string;
}

export default boot(() => {
  // Eagerly initialize NEAR connection
  void mutate(NEAR_SWRV_KEY, getNear());
});
