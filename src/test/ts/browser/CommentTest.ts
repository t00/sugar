import Comment from 'ephox/sugar/api/node/Comment';
import Element from 'ephox/sugar/api/node/Element';
import Traverse from 'ephox/sugar/api/search/Traverse';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('CommentTest', function() {
  var ensureClobberedTextNodeDoesNotThrow = function () {
    var span = Element.fromHtml('<span><!--a--></span>');
    Traverse.child(span, 0).each(function (text0) {
      span.dom().innerHTML = 'smashed';
      var v = Comment.get(text0); // Throws in IE10.
      assert.eq('string', typeof(v));
    });
  };

  ensureClobberedTextNodeDoesNotThrow();

  var notComment = Element.fromTag('span');
  var c = Element.fromHtml('<!--a-->');
  assert.eq('a', Comment.get(c));
  Comment.set(c, 'blue');
  assert.eq('blue', c.dom().nodeValue);

  try {
    Comment.get(notComment);
    assert.fail('get on non-comment did not throw');
  } catch (e) {
    // pass
  }

  try {
    Comment.set(notComment, 'bogus');
    assert.fail('set on non-comment did not throw');
  } catch (e) {
    // pass
  }
});

