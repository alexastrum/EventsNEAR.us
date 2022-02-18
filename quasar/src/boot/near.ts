import { boot } from 'quasar/wrappers';
import { mutate } from 'src/hooks/swrv';
import { getNear } from 'src/services/near';
// import { mutate } from 'src/hooks/swrv';
// import { getNear, NEAR_SWRV_KEY } from 'src/services/near';

export default boot(() => {
  // Eagerly initialize NEAR connection
  void mutate('', getNear());
});
