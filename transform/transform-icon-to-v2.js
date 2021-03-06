import { Transform } from 'jscodeshift';
const iconMap = {
  IconAddCircle: 'IconPlusCircle',
  IconAdd: 'IconPlus',
  IconAudioFileOutline: 'IconFileAudio',
  IconCreate: 'IconPen',
  IconError: 'IconCloseCircleFill',
  IconFavoriteOutline: 'IconHeart',
  IconFavorite: 'IconHeartFill',
  IconFileOutline: 'IconFile',
  IconHeartOutline: 'IconHeart',
  IconHelp: 'IconQuestionCircleFill',
  IconImageFileOutline: 'IconFileImage',
  IconInfoFill: 'IconInfoCircleFill',
  IconInfoOutline: 'IconInfoCircle',
  IconLike: 'IconThumbUp',
  IconMuteOutline: 'IconMute',
  IconPauseCircleOutline: 'IconPauseCircle',
  IconPdfFileOutline: 'IconFilePdf',
  IconPeople: 'IconUserGroup',
  IconPerson: 'IconUser',
  IconPlace: 'IconLocation',
  IconPlayCircleOutline: 'IconPlayCircle',
  IconRemoveCircle: 'IconMinusCircleFill',
  IconRemove: 'IconMinus',
  IconSoundOutline: 'IconSound',
  IconStarOutline: 'IconStar',
  IconSyncGreen: 'IconSync',
  IconVideoFileOutline: 'IconFileVideo',
  IconWarningCircle: 'IconExclamationCircle',
  IconWarningFill: 'IconExclamationCircleFill',
  IconFaceNoExpression: 'IconFaceMehFill',
  IconFaceSmile: 'IconFaceSmileFill',
  IconFaceUnsmile: 'IconFaceFrownFill',
  IconReport: 'IconExclamationPolygonFill',
};

const libraryName = '@bytedesign/web-react/icon';

const transform: Transform = (file, api, options) => {
  const j = api.jscodeshift;
  const printOptions = options.printOptions || { quote: 'single' };
  const root = j(file.source);

  let hasModifications = false;
  root
    .find(j.ImportDeclaration)
    .filter(e => {
      if (e.value.source.value === libraryName) {
        return (
          e.value.specifiers.filter(icon => {
            if (iconMap[icon.imported.name]) {
              return true;
            }
          }).length > 0
        );
      }
    })
    .forEach(node => {
      hasModifications = true;
      node.value.specifiers = node.value.specifiers.map(specifier => {
        if (iconMap[specifier.imported.name]) {
          return j.importSpecifier(
            j.identifier(iconMap[specifier.imported.name]),
          );
        } else {
          return specifier;
        }
      });
    });

  if (!hasModifications) {
    return;
  }
  root
    .findJSXElements()
    .filter(e => {
      if (e.value.openingElement) {
        const { openingElement } = e.value;
        if (iconMap[openingElement.name.name]) {
          return true;
        }
      }
    })
    .replaceWith(node => {
      const newName = j.jsxIdentifier(
        iconMap[node.value.openingElement.name.name],
      );

      const element = {
        ...node.value,
        name: newName,
        openingElement: {
          ...node.value.openingElement,
          name: newName,
        },
      };
      if (!element.openingElement.selfClosing) {
        element.closingElement = {
          ...node.value.closingElement,
          name: newName,
        };
      }
      return j.jsxElement.from(element);
    });

  return root.toSource();
};

export default transform;
