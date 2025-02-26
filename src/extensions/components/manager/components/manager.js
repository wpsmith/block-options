/**
 * External dependencies
 */
import map from 'lodash/map';

/**
 * WordPress dependencies
 */
const { __, sprintf } = wp.i18n;
const { withSelect, withDispatch, select } = wp.data;
const { compose, withState} = wp.compose;
const { Fragment, Component } = wp.element;
const { PluginMoreMenuItem } = wp.editPost;
const { withSpokenMessages, Modal, CheckboxControl } = wp.components;

const capitalize = ( str ) => {
	return str.charAt(0).toUpperCase() + str.slice(1);
};


/**
 * Render plugin
 */
class FeaturesManager extends Component {

	constructor( props ) {
		super( ...arguments );

		this.state   = {
			isOpen: false,
		}
	}
	
	render(){
		const {
			editorSettings,
			onToggle,
		} = this.props;

		const closeModal = () => (
			this.setState( { isOpen: false } )
		);

		return (
			<Fragment>
				<PluginMoreMenuItem
					icon={ null }
					role="menuitemcheckbox"
					onClick={ () => {
						this.setState( { isOpen: true } );
					} }
				>
					{ __( 'EditorsKit Settings' ) }
				</PluginMoreMenuItem>
				{ this.state.isOpen ?
					<Modal
						title={ __( 'EditorsKit Settings' ) }
						onRequestClose={ () => closeModal() }
						closeLabel={ __( 'Close' ) }
						icon={ null }
						className='editorskit-modal-component components-modal--editorskit-features-manager'
					>
						{ map( editorSettings.editorskit, ( category ) => {
							return(
								<section className="edit-post-options-modal__section">
									<h2 class="edit-post-options-modal__section-title">{ category.label }</h2>
									{ map( category.items, ( item ) => {
										return(
											<CheckboxControl
												className="edit-post-options-modal__option"
												label={ item.label }
												checked={ !select( 'core/edit-post' ).isFeatureActive( 'disableEditorsKit' + capitalize( item.name ) + capitalize( category.name ) ) }
												onChange={ () => onToggle( category.name, item.name ) }
											/>
										);
									} )}
								</section>
							);
						} )}
					</Modal>
				: null }
			</Fragment>
		);
	}
};

export default compose( [
	withSelect( ( select ) => ( {
		editorSettings: select('core/editor').getEditorSettings(),
		preferences: select( 'core/edit-post' ).getPreferences(),
	} ) ),
	withDispatch( ( dispatch, ownProps ) => ( {
		onToggle( category, item ) {
			dispatch( 'core/edit-post' ).toggleFeature( 'disableEditorsKit' + capitalize( item ) + capitalize( category ) );
		},
	} ) ),
	withSpokenMessages,
] )( FeaturesManager );