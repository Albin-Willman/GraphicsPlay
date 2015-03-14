module ThreeDHelper
  def cube(sides)
    content_tag :div, class: 'cube-wrap' do
      content_tag :div, class: 'cube rotate rotate-y' do
        safe_join(render_sides(sides))
      end
    end
  end

  def render_sides(sides)
    sides.map { |side, side_info| render_side(side, side_info) }
  end

  def render_side(side, side_info)
    side_info = default_side(side_info) unless side_info.is_a?(Hash)
    side_class = [side, side_info[:class]].reject(&:blank?).join(' ')
    content_tag :div, class: side_class do
      side_info[:content]
    end
  end

  def default_side(content)
    { content: content, class: '' }
  end

end