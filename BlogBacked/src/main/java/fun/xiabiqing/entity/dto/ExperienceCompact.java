package fun.xiabiqing.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceCompact {
    private String type;
    private String title;
    private String content;
    private Integer score;
}
