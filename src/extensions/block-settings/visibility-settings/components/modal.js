

/**
 * Internal dependencies
 */
import DevicesOptions from '../../../advanced-controls/options/devices/';
import UserStateOptions from '../../../advanced-controls/options/state/';
import LogicOptions from '../../../advanced-controls/options/logic/';
import ACFOptions from '../../../advanced-controls/options/acf/';

/**
 * WordPress dependencies
 */
const { __, sprintf } = wp.i18n;
const { select, withSelect } = wp.data;
const { Fragment, Component } = wp.element;
const { Button, Modal, TextControl, TabPanel, withSpokenMessages } = wp.components;
const { PluginBlockSettingsMenuItem } = wp.editPost;
const { compose } = wp.compose;

const restrictedBlocks = [ 'core/freeform', 'core/shortcode', 'core/block', 'core/template' ];

/**
 * Render plugin
 */
class BlockSettings extends Component {

	constructor( props ) {
		super( ...arguments );

		this.reloadModal = this.reloadModal.bind( this );

		this.state   = {
			settings: '',
			isOpen: false,
			reload: false,
		}

	}

	reloadModal(){

		this.setState( { reload: !this.state.reload } );
	}

	render() {

		const {
			isDisabledDevices,
			isDisabledUserState,
			isDisabledLogic,
			isDisabledACF,
		} = this.props;
		
		let selectedBlock = this.props.selectedBlock;
		selectedBlock = Object.assign( { reloadModal: this.reloadModal }, selectedBlock );

		const closeModal = () => (
			this.setState( { isOpen: false } )
		);

		const tabs = [];

		if( !isDisabledDevices || !isDisabledUserState ){
			tabs.push({
				name: 'default',
				title: __( 'Default' ),
				className: 'editorskit-default',
			});
		}

		if( !isDisabledLogic || !isDisabledACF ){
			tabs.push({
				name: 'advanced',
				title: __( 'Advanced' ),
				className: 'editorskit-advanced',
			});
		}
		
		//if all options are disabled return nothing
		if( isDisabledDevices && isDisabledUserState && isDisabledLogic && isDisabledACF  ){
			return null;
		}
		
		//return nothing if restricted
		if( typeof selectedBlock.name!== 'undefined' && restrictedBlocks.includes( selectedBlock.name ) ){
			return null;
		}

		return (
			<Fragment>
				<PluginBlockSettingsMenuItem
					icon='visibility'
					label={ __( 'Visibility Settings' ) }
					onClick={ () => {
						this.setState( { isOpen: true } );
					} }
				>
					
				</PluginBlockSettingsMenuItem>
				{ this.state.isOpen && typeof selectedBlock.name!== 'undefined' && !restrictedBlocks.includes( selectedBlock.name ) ?
					<Modal
						title={ __( 'Visibility Settings' ) }
						onRequestClose={ () => closeModal() }
						closeLabel={ __( 'Close' ) }
						className="editorskit-components-modal__content"
					>
						<TabPanel className="editorskit-tab-panel"
							activeClass="is-active"
							tabs={ tabs }>
							{
								( tab ) => {
									switch( tab.name ){
										case 'advanced':
											return[
												!isDisabledLogic && LogicOptions( selectedBlock ),
												!isDisabledACF && <ACFOptions selectedBlock={ selectedBlock } />,
											];
										break;
		    							default:
		    								return[
		    									<small>{ __( 'Attention: The display settings (show/hide for mobile, tablet, desktop or users) will only take effect once you are on the live page, and not while you\'re editing in Gutenberg.' ) }</small>,
												!isDisabledDevices && DevicesOptions( selectedBlock ),
												!isDisabledUserState && UserStateOptions( selectedBlock ),
											];
		    							break;
									}
								}
							}
						</TabPanel>
					</Modal>
				: null }

			</Fragment>
		);
	}
};

export default compose(
	withSelect( select => {
		const selectedBlock = select( 'core/block-editor' ).getSelectedBlock();
		
		if ( ! selectedBlock ) {
			return {};
		}

		return {
			selectedBlock: selectedBlock,
			isDisabledDevices : select( 'core/edit-post' ).isFeatureActive( 'disableEditorsKitDevicesVisibility' ),
			isDisabledUserState : select( 'core/edit-post' ).isFeatureActive( 'disableEditorsKitUserStateVisibility' ),
			isDisabledLogic : select( 'core/edit-post' ).isFeatureActive( 'disableEditorsKitLogicVisibility' ),
			isDisabledACF : select( 'core/edit-post' ).isFeatureActive( 'disableEditorsKitAcfVisibility' ),
		};
	} ),
	withSpokenMessages,
)( BlockSettings );
