define(function(require, exports, module) {
var Famous = function(cb) { cb.call(this, require) };
Famous.App = {};
Famous.App.Custom_ConversationSurface = require('app/custom/ConversationSurface');
Famous.App.Custom_InComingTransform = require('app/custom/InComingTransform');
Famous.App.Custom_LightBox = require('app/custom/LightBox');
Famous.App.Custom_MouseSync = require('app/custom/MouseSync');
Famous.App.Custom_Scrollview = require('app/custom/Scrollview');
Famous.App.Custom_Surface = require('app/custom/Surface');
Famous.App.Custom_Templates = require('app/custom/Templates');
Famous.App.Custom_TouchSync = require('app/custom/TouchSync');
Famous.App.Custom_UpDownTransform = require('app/custom/UpDownTransform');
Famous.App.Custom_contactItemWidget = require('app/custom/contactItemWidget');
Famous.App.Models_Call = require('app/models/Call');
Famous.App.Models_CallCollection = require('app/models/CallCollection');
Famous.App.Models_Contact = require('app/models/Contact');
Famous.App.Models_ContactCollection = require('app/models/ContactCollection');
Famous.App.Models_Conversation = require('app/models/Conversation');
Famous.App.Models_ConversationCollection = require('app/models/ConversationCollection');
Famous.App.Models_Settings = require('app/models/Settings');
Famous.App.Models_SocialContactCollection = require('app/models/SocialContactCollection');
Famous.App.App = require('app/App');
Famous.App.MainController = require('app/MainController');
Famous.App.Config = require('app/config');
Famous.Famous = {};
Famous.Famous.CanvasSurface = require('famous/CanvasSurface');
Famous.Famous.ContainerSurface = require('famous/ContainerSurface');
Famous.Famous.Context = require('famous/Context');
Famous.Famous.ElementAllocator = require('famous/ElementAllocator');
Famous.Famous.Engine = require('famous/Engine');
Famous.Famous.Entity = require('famous/Entity');
Famous.Famous.EventArbiter = require('famous/EventArbiter');
Famous.Famous.EventHandler = require('famous/EventHandler');
Famous.Famous.Group = require('famous/Group');
Famous.Famous.ImageSurface = require('famous/ImageSurface');
Famous.Famous.Matrix = require('famous/Matrix');
Famous.Famous.Modifier = require('famous/Modifier');
Famous.Famous.MultipleTransition = require('famous/MultipleTransition');
Famous.Famous.OptionsManager = require('famous/OptionsManager');
Famous.Famous.RenderNode = require('famous/RenderNode');
Famous.Famous.Scene = require('famous/Scene');
Famous.Famous.SceneCompiler = require('famous/SceneCompiler');
Famous.Famous.SpecParser = require('famous/SpecParser');
Famous.Famous.Surface = require('famous/Surface');
Famous.Famous.Timer = require('famous/Timer');
Famous.Famous.Transitionable = require('famous/Transitionable');
Famous.Famous.TweenTransition = require('famous/TweenTransition');
Famous.Famous.Utility = require('famous/Utility');
Famous.Famous.VideoSurface = require('famous/VideoSurface');
Famous.Famous.View = require('famous/View');
Famous.Famous.ViewSequence = require('famous/ViewSequence');
Famous.Famous.WebGLSurface = require('famous/WebGLSurface');
Famous.FamousAnimation = {};
Famous.FamousAnimation.Animation = require('famous-animation/Animation');
Famous.FamousAnimation.AnimationEngine = require('famous-animation/AnimationEngine');
Famous.FamousAnimation.CubicBezier = require('famous-animation/CubicBezier');
Famous.FamousAnimation.Easing = require('famous-animation/Easing');
Famous.FamousAnimation.GenericAnimation = require('famous-animation/GenericAnimation');
Famous.FamousAnimation.Idle = require('famous-animation/Idle');
Famous.FamousAnimation.PiecewiseCubicBezier = require('famous-animation/PiecewiseCubicBezier');
Famous.FamousAnimation.RegisterEasing = require('famous-animation/RegisterEasing');
Famous.FamousAnimation.Sequence = require('famous-animation/Sequence');
Famous.FamousAnimation.Timer = require('famous-animation/Timer');
Famous.FamousAudio = {};
Famous.FamousAudio.BufferLoader = require('famous-audio/BufferLoader');
Famous.FamousAudio.SoundPlayer = require('famous-audio/SoundPlayer');
Famous.FamousColor = {};
Famous.FamousColor.Color = require('famous-color/Color');
Famous.FamousColor.ColorPalette = require('famous-color/ColorPalette');
Famous.FamousColor.ColorPalettes = require('famous-color/ColorPalettes');
Famous.FamousMath = {};
Famous.FamousMath.Quaternion = require('famous-math/Quaternion');
Famous.FamousMath.Vector = require('famous-math/Vector');
Famous.FamousModifiers = {};
Famous.FamousModifiers.Camera = require('famous-modifiers/Camera');
Famous.FamousModifiers.Draggable = require('famous-modifiers/Draggable');
Famous.FamousPhysics = {};
Famous.FamousPhysics.Bodies_Body = require('famous-physics/bodies/Body');
Famous.FamousPhysics.Bodies_Circle = require('famous-physics/bodies/Circle');
Famous.FamousPhysics.Bodies_Particle = require('famous-physics/bodies/Particle');
Famous.FamousPhysics.Bodies_Rectangle = require('famous-physics/bodies/Rectangle');
Famous.FamousPhysics.Constraints_Collision = require('famous-physics/constraints/Collision');
Famous.FamousPhysics.Constraints_CollisionJacobian = require('famous-physics/constraints/CollisionJacobian');
Famous.FamousPhysics.Constraints_Constraint = require('famous-physics/constraints/Constraint');
Famous.FamousPhysics.Constraints_Curve = require('famous-physics/constraints/Curve');
Famous.FamousPhysics.Constraints_Distance = require('famous-physics/constraints/Distance');
Famous.FamousPhysics.Constraints_Distance1D = require('famous-physics/constraints/Distance1D');
Famous.FamousPhysics.Constraints_Rod = require('famous-physics/constraints/Rod');
Famous.FamousPhysics.Constraints_Rope = require('famous-physics/constraints/Rope');
Famous.FamousPhysics.Constraints_StiffSpring = require('famous-physics/constraints/StiffSpring');
Famous.FamousPhysics.Constraints_Surface = require('famous-physics/constraints/Surface');
Famous.FamousPhysics.Constraints_Wall = require('famous-physics/constraints/Wall');
Famous.FamousPhysics.Constraints_Walls = require('famous-physics/constraints/Walls');
Famous.FamousPhysics.Constraints_joint = require('famous-physics/constraints/joint');
Famous.FamousPhysics.Forces_Drag = require('famous-physics/forces/Drag');
Famous.FamousPhysics.Forces_Force = require('famous-physics/forces/Force');
Famous.FamousPhysics.Forces_Repulsion = require('famous-physics/forces/Repulsion');
Famous.FamousPhysics.Forces_Spring = require('famous-physics/forces/Spring');
Famous.FamousPhysics.Forces_TorqueSpring = require('famous-physics/forces/TorqueSpring');
Famous.FamousPhysics.Forces_VectorField = require('famous-physics/forces/VectorField');
Famous.FamousPhysics.Forces_rotationalDrag = require('famous-physics/forces/rotationalDrag');
Famous.FamousPhysics.Integrator_SymplecticEuler = require('famous-physics/integrator/SymplecticEuler');
Famous.FamousPhysics.Integrator_verlet = require('famous-physics/integrator/verlet');
Famous.FamousPhysics.Math_GaussSeidel = require('famous-physics/math/GaussSeidel');
Famous.FamousPhysics.Math_Quaternion = require('famous-physics/math/Quaternion');
Famous.FamousPhysics.Math_Random = require('famous-physics/math/Random');
Famous.FamousPhysics.Math_Vector = require('famous-physics/math/Vector');
Famous.FamousPhysics.Math_matrix = require('famous-physics/math/matrix');
Famous.FamousPhysics.Utils_PhysicsTransition = require('famous-physics/utils/PhysicsTransition');
Famous.FamousPhysics.Utils_PhysicsTransition2 = require('famous-physics/utils/PhysicsTransition2');
Famous.FamousPhysics.Utils_SpringTransition = require('famous-physics/utils/SpringTransition');
Famous.FamousPhysics.Utils_StiffSpringTransition = require('famous-physics/utils/StiffSpringTransition');
Famous.FamousPhysics.Utils_WallTransition = require('famous-physics/utils/WallTransition');
Famous.FamousPhysics.PhysicsEngine = require('famous-physics/PhysicsEngine');
Famous.FamousSync = {};
Famous.FamousSync.FastClick = require('famous-sync/FastClick');
Famous.FamousSync.GenericSync = require('famous-sync/GenericSync');
Famous.FamousSync.MouseSync = require('famous-sync/MouseSync');
Famous.FamousSync.PinchSync = require('famous-sync/PinchSync');
Famous.FamousSync.RotateSync = require('famous-sync/RotateSync');
Famous.FamousSync.ScaleSync = require('famous-sync/ScaleSync');
Famous.FamousSync.ScrollSync = require('famous-sync/ScrollSync');
Famous.FamousSync.TouchSync = require('famous-sync/TouchSync');
Famous.FamousSync.TouchTracker = require('famous-sync/TouchTracker');
Famous.FamousSync.TwoFingerSync = require('famous-sync/TwoFingerSync');
Famous.FamousUtils = {};
Famous.FamousUtils.FormatTime = require('famous-utils/FormatTime');
Famous.FamousUtils.KeyCodes = require('famous-utils/KeyCodes');
Famous.FamousUtils.NoiseImage = require('famous-utils/NoiseImage');
Famous.FamousUtils.Time = require('famous-utils/Time');
Famous.FamousUtils.TimeAgo = require('famous-utils/TimeAgo');
Famous.FamousUtils.Utils = require('famous-utils/Utils');
Famous.FamousViews = {};
Famous.FamousViews.Accordion = require('famous-views/Accordion');
Famous.FamousViews.ControlSet = require('famous-views/ControlSet');
Famous.FamousViews.EnergyHelper = require('famous-views/EnergyHelper');
Famous.FamousViews.Flip = require('famous-views/Flip');
Famous.FamousViews.LightBox = require('famous-views/LightBox');
Famous.FamousViews.ScrollContainer = require('famous-views/ScrollContainer');
Famous.FamousViews.Scrollview = require('famous-views/Scrollview');
Famous.FamousViews.SequentialLayout = require('famous-views/SequentialLayout');
Famous.FamousViews.Shaper = require('famous-views/Shaper');
Famous.FamousViews.Swappable = require('famous-views/Swappable');
Famous.FamousWidgets = {};
Famous.FamousWidgets.FeedItem = require('famous-widgets/FeedItem');
Famous.FamousWidgets.FeedStream = require('famous-widgets/FeedStream');
Famous.FamousWidgets.IconBar = require('famous-widgets/IconBar');
Famous.FamousWidgets.InfoBox = require('famous-widgets/InfoBox');
Famous.FamousWidgets.NavMenu = require('famous-widgets/NavMenu');
Famous.FamousWidgets.NavigationBar = require('famous-widgets/NavigationBar');
Famous.FamousWidgets.ScrollContainer = require('famous-widgets/ScrollContainer');
Famous.FamousWidgets.ShrinkContainer = require('famous-widgets/ShrinkContainer');
Famous.FamousWidgets.Slider = require('famous-widgets/Slider');
Famous.FamousWidgets.TitleBar = require('famous-widgets/TitleBar');
Famous.FamousWidgets.ToggleButton = require('famous-widgets/ToggleButton');
Famous.Views = {};
Famous.Views.Conversation_ConversationItemView = require('views/Conversation/ConversationItemView');
Famous.Views.Conversation_ConversationView = require('views/Conversation/ConversationView');
Famous.Views.Call_ConnectedCallView = require('views/call/ConnectedCallView');
Famous.Views.Call_IncomingCallView = require('views/call/IncomingCallView');
Famous.Views.Call_OutgoingCallView = require('views/call/OutgoingCallView');
Famous.Views.Contact_AddContactView = require('views/contact/AddContactView');
Famous.Views.Contact_ContactItemView = require('views/contact/ContactItemView');
Famous.Views.Contact_ContactsSectionView = require('views/contact/ContactsSectionView');
Famous.Views.Contact_ImportContactView = require('views/contact/ImportContactView');
Famous.Views.Contact_SocialItemView = require('views/contact/SocialItemView');
Famous.Views.Contact_SocialView = require('views/contact/SocialView');
Famous.Views.Contact_test = require('views/contact/test');
Famous.Views.Favorite_AddFavoriteView = require('views/favorite/AddFavoriteView');
Famous.Views.Favorite_FavoriteItemView = require('views/favorite/FavoriteItemView');
Famous.Views.Favorite_FavoritesSectionView = require('views/favorite/FavoritesSectionView');
Famous.Views.Recent_RecentItemView = require('views/recent/RecentItemView');
Famous.Views.Recent_RecentsSectionView = require('views/recent/RecentsSectionView');
Famous.Views.Setting_SettingsSectionView = require('views/setting/SettingsSectionView');
Famous.Views.AlertView = require('views/AlertView');
Famous.Views.CameraView = require('views/CameraView');
module.exports = Famous; });