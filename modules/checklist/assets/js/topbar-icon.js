import { useEffect, useState } from 'react';
import { useQuery } from '@elementor/query';
import { __privateListenTo as listenTo, commandEndEvent } from '@elementor/editor-v1-adapters';
import RocketIcon from '@elementor/icons/RocketIcon';
import { Infotip } from '@elementor/ui';
import ReminderModal from './app/components/reminder-modal';
import * as React from 'react';
import { USER_PROGRESS } from './utils/consts';
import { fetchUserProgress } from './utils/functions';

const { CHECKLIST_CLOSED_IN_THE_EDITOR_FOR_FIRST_TIME } = USER_PROGRESS;

const TopBarIcon = () => {
	const [ hasRoot, setHasRoot ] = useState( false ),
		[ open, setOpen ] = useState( false ),
		{ error, data: userProgress } = useQuery( {
			queryKey: [ 'closedForFirstTime' ],
			queryFn: fetchUserProgress,
		} ),
		closedForFirstTime = userProgress?.[ CHECKLIST_CLOSED_IN_THE_EDITOR_FOR_FIRST_TIME ];

	useEffect( () => {
		return listenTo( commandEndEvent( 'checklist/toggle-popup' ), ( e ) => {
			setHasRoot( e.args.isOpen );
		} );
	}, [ hasRoot ] );

	useEffect( () => {
		const handleFirstClosed = () => {
			setOpen( true );
		};

		window.addEventListener( 'elementor/checklist/first_close', handleFirstClosed );

		return () => {
			window.removeEventListener( 'elementor/checklist/first_close', handleFirstClosed );
		};
	}, [] );

	if ( error ) {
		return null;
	}

	return hasRoot && ! closedForFirstTime ? (
		<RocketIcon />
	) : (
		<Infotip
			placement="bottom-start"
			content={ <ReminderModal setHasRoot={ setHasRoot } setOpen={ setOpen } /> }
			open={ open }
			PopperProps={ {
				modifiers: [
					{
						name: 'offset',
						options:
							{ offset: [ -16, 12 ] },
					},
				],
			} }>
			<RocketIcon />
		</Infotip>
	);
};

export default TopBarIcon;