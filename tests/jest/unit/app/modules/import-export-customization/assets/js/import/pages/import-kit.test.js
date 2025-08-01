import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImportKit from 'elementor/app/modules/import-export-customization/assets/js/import/pages/import-kit';
import eventsConfig from 'elementor/core/common/modules/events-manager/assets/js/events-config';

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
const mockUseImportContext = jest.fn();
const mockUseUploadKit = jest.fn();

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/import/context/import-context', () => ( {
	useImportContext: () => mockUseImportContext(),
	IMPORT_STATUS: {
		PENDING: 'PENDING',
		UPLOADING: 'UPLOADING',
		CUSTOMIZING: 'CUSTOMIZING',
		IMPORTING: 'IMPORTING',
		COMPLETED: 'COMPLETED',
	},
} ) );

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/import/hooks/use-upload-kit', () => ( {
	useUploadKit: () => mockUseUploadKit(),
} ) );

jest.mock( '@reach/router', () => ( {
	useNavigate: () => mockNavigate,
} ) );

const mockSendPageViewsWebsiteTemplates = jest.fn();
jest.mock( 'elementor/app/assets/js/event-track/apps-event-tracking', () => ( {
	AppsEventTracking: {
		sendPageViewsWebsiteTemplates: ( ...args ) => mockSendPageViewsWebsiteTemplates( ...args ),
	},
} ) );

describe( 'ImportKit Page', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		global.elementorAppConfig = { base_url: 'http://localhost' };
		global.elementorCommon = {
			eventsManager: {
				config: eventsConfig,
			},
		};
	} );

	afterEach( () => {
		delete global.elementorAppConfig;
		delete global.elementorCommon;
	} );

	function setup( {
		uploading = false,
		error = null,
		data = {},
	} = {} ) {
		mockUseImportContext.mockReturnValue( {
			data,
			dispatch: mockDispatch,
		} );
		mockUseUploadKit.mockReturnValue( { uploading, error } );
	}

	it( 'renders loader when uploading', async () => {
		// Arrange
		setup( { uploading: true } );
		// Act
		render( <ImportKit /> );
		// Assert
		expect( screen.getByRole( 'progressbar' ) ).toBeTruthy();

		await waitFor( () => expect( mockSendPageViewsWebsiteTemplates ).toHaveBeenCalledWith( 'kit_import_upload_box' ) );
	} );

	it( 'renders ImportError when error is present', () => {
		// Arrange
		setup( { error: { message: 'Some error' } } );
		// Act
		render( <ImportKit /> );
		// Assert
		expect( screen.getByTestId( 'import-error-try-again-button' ) ).toBeTruthy();
		expect( screen.getByText( /Uploading failed/i ) ).toBeTruthy();
	} );

	it( 'renders main content and DropZone when not uploading or error', () => {
		// Arrange
		setup();
		// Act
		render( <ImportKit /> );
		// Assert
		expect( screen.getByTestId( 'content-container' ) ).toBeTruthy();
		expect( screen.getByTestId( 'drop-zone' ) ).toBeTruthy();
	} );

	it( 'dispatches SET_FILE when file is dropped on DropZone', () => {
		// Arrange
		setup();
		render( <ImportKit /> );
		const dropZone = screen.getByTestId( 'drop-zone' );
		const file = new File( [ 'dummy' ], 'test.zip', { type: 'application/zip' } );
		// Act
		fireEvent.drop( dropZone, {
			dataTransfer: {
				files: [ file ],
			},
		} );
		// Assert
		expect( mockDispatch ).toHaveBeenCalledWith( { type: 'SET_FILE', payload: file } );
	} );
} );
