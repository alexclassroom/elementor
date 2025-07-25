import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { fireEvent, screen } from '@testing-library/react';

import { PositionControl } from '../position-control';

jest.mock( '@elementor/editor-v1-adapters' );

const propType = createMockPropType( {
	kind: 'union',
	prop_types: {
		string: createMockPropType( { kind: 'plain' } ),
		'object-position': createMockPropType( {
			kind: 'object',
			shape: {
				x: createMockPropType( { kind: 'plain' } ),
				y: createMockPropType( { kind: 'plain' } ),
			},
		} ),
	},
} );

jest.mocked( isExperimentActive ).mockReturnValue( true );

describe( 'PositionControl', () => {
	it( 'should render position offset prop type values with custom position', () => {
		// Arrange.
		const setValue = jest.fn();

		const props = {
			setValue,
			propType,
			bind: 'position',
			value: {
				$$type: 'object-position',
				value: {
					x: { $$type: 'size', value: { unit: 'px', size: 600 } },
					y: { $$type: 'size', value: { unit: 'px', size: 80 } },
				},
			},
		};

		// Act.
		renderControl( <PositionControl />, props );

		const [ x, y ] = screen.getAllByRole( 'spinbutton' );
		expect( screen.getByText( 'Object position' ) ).toBeInTheDocument();
		expect( x ).toHaveValue( 600 );
		expect( y ).toHaveValue( 80 );
	} );

	it( 'should render position offset prop type values with plain value', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			propType,
			bind: 'object-position',
			value: {
				$$type: 'string',
				value: 'center center',
			},
		};

		// Act.
		renderControl( <PositionControl />, props );

		// Assert.
		expect( screen.getByText( 'Object position' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Center center' ) ).toBeInTheDocument();
	} );

	it( 'should switch to custom position', async () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			propType,
			bind: 'object-position',
			value: {
				$$type: 'string',
				value: 'center center',
			},
		};

		renderControl( <PositionControl />, props );

		// Act.
		const select = screen.getByRole( 'combobox' );

		fireEvent.mouseDown( select );

		fireEvent.click( screen.getByText( 'Custom' ) );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'object-position',
			value: {
				x: null,
				y: null,
			},
		} );
	} );

	it( 'should switch to plain position', async () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			propType,
			bind: 'object-position',
			value: {
				$$type: 'object-position',
				value: {
					x: null,
					y: null,
				},
			},
		};

		renderControl( <PositionControl />, props );

		// Act.
		const select = screen.getByRole( 'combobox' );

		fireEvent.mouseDown( select );

		fireEvent.click( screen.getByText( 'Center center' ) );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'string',
			value: 'center center',
		} );
	} );
} );
