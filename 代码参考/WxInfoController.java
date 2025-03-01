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
 * @Since 2022/7/29
 */
@SuppressWarnings("all")
@RestController
@RequestMapping("/wx/info")
public class WxInfoController {
    @Autowired
    private InfoMapper infoMapper;
    @RequestMapping("/list")
    public Object list (Info info){
        List<Info> list = infoMapper.list(info);
        Map<Object, Object> data = new HashMap<Object, Object>();
        data.put("infoList",list);
        return ResponseUtil.ok(data);
    }
}