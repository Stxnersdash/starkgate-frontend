import {useLogger} from '@starkware-industries/commons-js-hooks';
import {getStarknet} from '@starkware-industries/commons-js-libs/get-starknet';
import {promiseHandler} from '@starkware-industries/commons-js-utils';
import PropTypes from 'prop-types';
import React, {useCallback, useState} from 'react';

import {useAccountChange, useEnvs} from '../../hooks';
import {BlockHashContext} from './block-hash-context';

export const BlockHashProvider = ({children}) => {
  const logger = useLogger(BlockHashProvider.displayName);
  const {POLL_BLOCK_NUMBER_INTERVAL} = useEnvs();
  const [blockHash, setBlockHash] = useState();

  const fetchBlockHash = useCallback(async () => {
    const [response] = await promiseHandler(getStarknet().provider.getBlock());
    if (response) {
      setBlockHash(response.block_hash);
    }
  }, []);

  useAccountChange(() => {
    logger.log('Starting blockHash fetching');
    fetchBlockHash();
    const intervalId = setInterval(() => {
      fetchBlockHash();
    }, POLL_BLOCK_NUMBER_INTERVAL);
    return () => {
      logger.log('Stopping blockHash fetching');
      clearInterval(intervalId);
    };
  });

  return <BlockHashContext.Provider value={blockHash}>{children}</BlockHashContext.Provider>;
};

BlockHashProvider.displayName = 'BlockHashProvider';

BlockHashProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
};
