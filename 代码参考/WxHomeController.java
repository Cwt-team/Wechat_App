package com.zking.ssm.wxcontroller;
 
import com.zking.ssm.mapper.InfoMapper;
import com.zking.ssm.model.Info;
import com.zking.ssm.util.ResponseUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
 
import java.util.HashMap;
import java.util.List;
import java.util.Map;
 
/**
 * @Autho donkee
 * @Since 2022/6/29
 */
@RestController
@RequestMapping("/wx/home")
public class WxHomeController {
    @Autowired
    private InfoMapper infoMapper;
    @RequestMapping("/index")
    public Object index(Info info) {
        List<Info> infoList = infoMapper.list(info);
        Map<Object, Object> data = new HashMap<Object, Object>();
        data.put("infoList",infoList);
        return ResponseUtil.ok(data);
    }
}