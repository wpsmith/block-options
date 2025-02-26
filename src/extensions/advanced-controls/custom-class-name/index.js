/**
 * External Dependencies
 */
import { split, replace, get, join } from 'lodash';

/**
 * Internal dependencies
 */
import './styles/editor.scss';
import './styles/style.scss';

/**
 * WordPress Dependencies
 */
const { __ } = wp.i18n;
const { addFilter, removeFilter } = wp.hooks;
const { Fragment }	= wp.element;
const { withSelect, select }	= wp.data;
const { compose, createHigherOrderComponent, withState }	= wp.compose;
const { hasBlockSupport }	= wp.blocks;
const { InspectorAdvancedControls }	= wp.blockEditor;
const { TextControl, FormTokenField }	= wp.components;

const enhance = compose(
	withState( {
		customClassNames: [],
	} ),
	withSelect( ( select, block ) => {
		const selectedBlock = select( 'core/block-editor' ).getSelectedBlock();
		let getClasses 	= get( selectedBlock, 'attributes.className' );

		if( getClasses ){
			getClasses = replace( getClasses, ',', ' ' );
		}

		if( selectedBlock && getClasses && join( block.customClassNames, ' ' ) !== getClasses  ){
			//apply to selected block only
			if( block.clientId == selectedBlock.clientId ){
				// props.attributes.className || ''
				block.setState({ customClassNames: split( getClasses, ' ' ) });
			}
		}
		return {
			suggestions: select('core/editor').getEditorSettings().editorskitCustomClassNames,
		};
	} ),
);


/**
 * Override the default edit UI to include a new block inspector control for
 * assigning the custom class name, if block supports custom class name.
 *
 * @param {function|Component} BlockEdit Original component.
 *
 * @return {string} Wrapped component.
 */
const withInspectorControl = createHigherOrderComponent( ( BlockEdit ) => {
	return enhance( ( { ...props } ) => {
		
		const hasCustomClassName = hasBlockSupport( props.name, 'customClassName', true );

		const {
			customClassNames,
			suggestions,
			setState,
		} = props;
		
		if ( hasCustomClassName && props.isSelected ) {
			return (
				<Fragment>
					<BlockEdit { ...props } />
					<InspectorAdvancedControls>
						<FormTokenField 
							label={ __( 'Additional CSS Class(es)' ) }
							value={ customClassNames } 
							suggestions={ suggestions } 
							maxSuggestions={ 20 }
							onChange={ ( nextValue ) => {
								props.setAttributes( {
									className: nextValue !== '' ? join( nextValue, ' ' ) : undefined,
								} );
								setState( { customClassNames : nextValue !== '' ? nextValue : undefined } )
							} }
							help={ __( 'Separate multiple classes with spaces.' ) }
						/>
					</InspectorAdvancedControls>
				</Fragment>
			);
		}

		return <BlockEdit { ...props } />;
	});
}, 'withInspectorControl' );

function applyFilters(){
	if( ! select( 'core/edit-post' ).isFeatureActive( 'disableEditorsKitCustomClassNamesTools' ) ){
		removeFilter( 'editor.BlockEdit', 'core/editor/custom-class-name/with-inspector-control' );
		addFilter( 'editor.BlockEdit', 'editorskit/custom-class-name/with-inspector-control', withInspectorControl );
	}
}

applyFilters();