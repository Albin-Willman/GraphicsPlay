module FlipHelper
  def flip_card(front, back)
    content_tag :div, class: 'flip-container', ontouchstart: "this.classList.toggle('hover');" do
      content_tag :div, class: 'flipper' do
        safe_join([
          content_tag(:div, front, class: 'front card'),
          content_tag(:div, back,  class: 'back card'),
          ])
      end
    end
  end
end
